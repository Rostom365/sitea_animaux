import db, { dbReady } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await dbReady;
  const revenueRes = await db.execute("SELECT COALESCE(SUM(total), 0) as total FROM orders");
  const pendingRes = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
  const deliveredRes = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'");

  return NextResponse.json({
    totalRevenue: revenueRes.rows[0].total,
    pendingCount: pendingRes.rows[0].count,
    deliveredCount: deliveredRes.rows[0].count,
  });
}
