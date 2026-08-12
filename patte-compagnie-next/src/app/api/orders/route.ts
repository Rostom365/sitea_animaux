import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

async function getItemsForOrder(orderId: number) {
  const res = await db.execute({ sql: "SELECT * FROM order_items WHERE orderId = ?", args: [orderId] });
  return res.rows.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    prix: row.prix,
    quantite: row.quantite,
    subTotal: row.subTotal,
  }));
}

async function rowToOrder(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    clientId: row.clientId,
    clientName: row.clientName,
    total: row.total,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: await getItemsForOrder(row.id as number),
  };
}

export async function GET(request: Request) {
  await dbReady;
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const res = clientId
    ? await db.execute({ sql: "SELECT * FROM orders WHERE clientId = ? ORDER BY createdAt DESC", args: [clientId] })
    : await db.execute("SELECT * FROM orders ORDER BY createdAt DESC");

  const orders = await Promise.all(res.rows.map(rowToOrder));
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const now = new Date().toISOString();

  const orderResult = await db.execute({
    sql: `
      INSERT INTO orders (clientId, clientName, total, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [body.clientId, body.clientName, body.total, body.status || "pending", now, now],
  });
  const orderId = orderResult.lastInsertRowid;

  for (const item of body.items || []) {
    await db.execute({
      sql: `
        INSERT INTO order_items (orderId, productId, productName, prix, quantite, subTotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [orderId!, item.productId, item.productName, item.prix, item.quantite, item.subTotal],
    });
  }

  return NextResponse.json({
    id: String(orderId),
    ...body,
    createdAt: now,
    updatedAt: now,
  });
}
