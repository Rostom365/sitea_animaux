import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbReady;
  const { id } = await params;

  const countRes = await db.execute({ sql: "SELECT COUNT(*) as count FROM orders WHERE clientId = ?", args: [id] });
  const totalRes = await db.execute({ sql: "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE clientId = ?", args: [id] });

  return NextResponse.json({
    orderCount: countRes.rows[0].count,
    totalSpent: totalRes.rows[0].total,
  });
}
