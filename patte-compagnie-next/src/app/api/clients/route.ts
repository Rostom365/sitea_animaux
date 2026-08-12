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

export async function GET() {
  await dbReady;
  const res = await db.execute("SELECT * FROM clients ORDER BY nom ASC");
  return NextResponse.json(res.rows.map(rowToClient));
}

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const createdAt = new Date().toISOString();
  const result = await db.execute({
    sql: `
      INSERT INTO clients (nom, email, telephone, adresse, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [body.nom, body.email, body.telephone || "", body.adresse || "", createdAt],
  });
  return NextResponse.json({ id: String(result.lastInsertRowid), ...body, createdAt });
}
