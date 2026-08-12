import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const { prenom, nom, email, telephone, dateNaissance, password } = body;

  if (!prenom || !nom || !email || !password) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const existingRes = await db.execute({
    sql: "SELECT id FROM clients WHERE email = ?",
    args: [email.trim().toLowerCase()],
  });
  if (existingRes.rows.length > 0) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const createdAt = new Date().toISOString();
  const result = await db.execute({
    sql: `
      INSERT INTO clients (prenom, nom, email, telephone, adresse, dateNaissance, password, createdAt)
      VALUES (?, ?, ?, ?, '', ?, ?, ?)
    `,
    args: [
      prenom.trim(),
      nom.trim(),
      email.trim().toLowerCase(),
      (telephone || "").trim(),
      (dateNaissance || "").trim(),
      password,
      createdAt,
    ],
  });

  return NextResponse.json({
    id: String(result.lastInsertRowid),
    prenom,
    nom,
    email: email.trim().toLowerCase(),
    telephone,
    dateNaissance,
    createdAt,
  });
}
