import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createTrip, getTripsByUser } from "@/lib/db/queries/trips";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const trips = await getTripsByUser(auth.user.id);
  return NextResponse.json(trips);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { destination, startDate, endDate } = body;

  if (!destination || !startDate || !endDate) {
    return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
  }

  const trip = await createTrip({
    userId: auth.user.id,
    destination,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return NextResponse.json(trip, { status: 201 });
}
