import { getNotificationsCount } from "@/db/preparedStatements";
import { NextResponse } from "next/server";

export async function GET() {
  const countResult = await getNotificationsCount.execute();
  return NextResponse.json(countResult[0]);
}
