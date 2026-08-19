import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

function rowToProduct(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    nom: row.nom,
    prix: row.prix,
    ancienPrix: row.ancienPrix,
    stock: row.stock,
    categorie: row.categorie,
    sousCategorie: row.sousCategorie,
    description: row.description,
    image: row.image,
    promo: Boolean(row.promo),
  };
}

export async function GET() {
  await dbReady;
  const res = await db.execute("SELECT * FROM products ORDER BY nom ASC");
  return NextResponse.json(res.rows.map(rowToProduct));
}

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const result = await db.execute({
    sql: `
      INSERT INTO products (nom, prix, ancienPrix, stock, categorie, sousCategorie, description, image, promo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      body.nom,
      body.prix,
      body.ancienPrix || null,
      body.stock,
      body.categorie,
      body.sousCategorie,
      body.description || "",
      body.image || "",
      body.promo ? 1 : 0,
    ],
  });
  return NextResponse.json({ id: String(result.lastInsertRowid), ...body });
}
