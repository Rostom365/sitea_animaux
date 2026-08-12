import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

function rowToPet(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    customerId: row.customerId,
    espece: row.espece,
    nom: row.nom,
    dateNaissanceConnue: Boolean(row.dateNaissanceConnue),
    dateNaissance: row.dateNaissance,
    estCroise: Boolean(row.estCroise),
    race: row.race,
    sexe: row.sexe,
    sterilise: row.sterilise,
    nourriture: row.nourriture ? String(row.nourriture).split(",").filter(Boolean) : [],
    besoinsSpeciaux: row.besoinsSpeciaux ? String(row.besoinsSpeciaux).split(",").filter(Boolean) : [],
    photo: row.photo,
    createdAt: row.createdAt,
  };
}

export async function GET(request: Request) {
  await dbReady;
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId requis" }, { status: 400 });

  const res = await db.execute({ sql: "SELECT * FROM pets WHERE customerId = ? ORDER BY id ASC", args: [customerId] });
  return NextResponse.json(res.rows.map(rowToPet));
}

export async function POST(request: Request) {
  await dbReady;
  const body = await request.json();
  const createdAt = new Date().toISOString();

  const result = await db.execute({
    sql: `
      INSERT INTO pets (
        customerId, espece, nom, dateNaissanceConnue, dateNaissance,
        estCroise, race, sexe, sterilise, nourriture, besoinsSpeciaux, photo, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      body.customerId,
      body.espece,
      body.nom,
      body.dateNaissanceConnue ? 1 : 0,
      body.dateNaissance || "",
      body.estCroise ? 1 : 0,
      body.race || "",
      body.sexe || "",
      body.sterilise || "",
      Array.isArray(body.nourriture) ? body.nourriture.join(",") : "",
      Array.isArray(body.besoinsSpeciaux) ? body.besoinsSpeciaux.join(",") : "",
      body.photo || "",
      createdAt,
    ],
  });

  return NextResponse.json({ id: String(result.lastInsertRowid), ...body, createdAt });
}
