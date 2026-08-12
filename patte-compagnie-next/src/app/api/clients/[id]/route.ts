import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

function rowToClient(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    telephone: row.telephone,
    adresse: row.adresse,
    dateNaissance: row.dateNaissance,
    createdAt: row.createdAt,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  const res = await db.execute({ sql: "SELECT * FROM clients WHERE id = ?", args: [id] });
  const row = res.rows[0];
  if (!row) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  return NextResponse.json(rowToClient(row));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM clients WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
