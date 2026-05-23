import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("ongoing"), // ongoing | completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fragments = pgTable("fragments", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull(),
  location: text("location"),
  description: text("description"),
  mediaUrl: text("media_url"), // photo or audio clip
  mediaType: text("media_type"), // image | audio
  status: text("status").notNull().default("pending"), // pending | ready
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Trip = InferSelectModel<typeof trips>;
export type Message = InferSelectModel<typeof messages>;
export type Fragment = InferSelectModel<typeof fragments>;
