import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

async function rowToOrder(row: Record<string, unknown>) {
  const itemsRes = await db.execute({ sql: "SELECT * FROM order_items WHERE orderId = ?", args: [row.id as number] });
  const items = itemsRes.rows.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    prix: item.prix,
    quantite: item.quantite,
    subTotal: item.subTotal,
  }));

  return {
    id: String(row.id),
    clientId: row.clientId,
    clientName: row.clientName,
    total: row.total,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  const res = await db.execute({ sql: "SELECT * FROM orders WHERE id = ?", args: [id] });
  const row = res.rows[0];
  if (!row) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json(await rowToOrder(row));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  const body = await request.json();
  const now = new Date().toISOString();

  await db.execute({ sql: "UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?", args: [body.status, now, id] });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM order_items WHERE orderId = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM orders WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
