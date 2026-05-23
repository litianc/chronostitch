import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { trips, messages, fragments, type Trip, type Message, type Fragment } from "../schema/trips";

// ---- Trips ----

export async function createTrip(data: {
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}): Promise<Trip> {
  const rows = await db.insert(trips).values(data).returning();
  return rows[0];
}

export async function getTripsByUser(userId: string): Promise<Trip[]> {
  return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
}

export async function getTripById(id: number): Promise<Trip | undefined> {
  const rows = await db.select().from(trips).where(eq(trips.id, id));
  return rows[0];
}

export async function completeTripById(id: number): Promise<Trip | undefined> {
  const rows = await db
    .update(trips)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(trips.id, id))
    .returning();
  return rows[0];
}

// ---- Messages ----

export async function getMessagesByTrip(tripId: number): Promise<Message[]> {
  return db.select().from(messages).where(eq(messages.tripId, tripId)).orderBy(messages.createdAt);
}

export async function addMessage(data: {
  tripId: number;
  role: string;
  content: string;
}): Promise<Message> {
  const rows = await db.insert(messages).values(data).returning();
  return rows[0];
}

// ---- Fragments ----

export async function getFragmentsByTrip(tripId: number): Promise<Fragment[]> {
  return db.select().from(fragments).where(eq(fragments.tripId, tripId)).orderBy(fragments.timestamp);
}

export async function createFragment(data: {
  tripId: number;
  timestamp: Date;
  location?: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: string;
  status?: string;
}): Promise<Fragment> {
  const rows = await db.insert(fragments).values(data).returning();
  return rows[0];
}

export async function updateFragmentStatus(id: number, status: string): Promise<Fragment | undefined> {
  const rows = await db
    .update(fragments)
    .set({ status })
    .where(eq(fragments.id, id))
    .returning();
  return rows[0];
}
