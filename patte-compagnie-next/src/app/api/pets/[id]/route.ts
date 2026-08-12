import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM pets WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
