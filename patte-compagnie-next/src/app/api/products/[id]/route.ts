import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  const result = await db.execute({ sql: "SELECT * FROM products WHERE id = ?", args: [id] });
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }
  const row = result.rows[0] as Record<string, unknown>;
  return NextResponse.json({
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
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  const body = await request.json();

  const fields = ["nom", "prix", "ancienPrix", "stock", "categorie", "sousCategorie", "description", "image", "promo"];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of fields) {
    if (field in body) {
      updates.push(`${field} = ?`);
      values.push(field === "promo" ? (body[field] ? 1 : 0) : body[field]);
    }
  }

  if (updates.length > 0) {
    values.push(id);
    await db.execute({ sql: `UPDATE products SET ${updates.join(", ")} WHERE id = ?`, args: values as (string | number)[] });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
