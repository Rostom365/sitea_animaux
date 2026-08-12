import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const { email, password } = body;

  const res = await db.execute({
    sql: "SELECT * FROM clients WHERE email = ?",
    args: [(email || "").trim().toLowerCase()],
  });
  const row = res.rows[0];

  if (!row || row.password !== password) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  return NextResponse.json({
    id: String(row.id),
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    telephone: row.telephone,
    dateNaissance: row.dateNaissance,
    createdAt: row.createdAt,
  });
}
