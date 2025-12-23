import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  idNumber: varchar("id_number").unique(),
  phoneNumber: varchar("phone_number").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["sponsor", "villager", "admin"] }).notNull().default("sponsor"),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  sponsorshipBundle: varchar("sponsorship_bundle", {
    enum: ["full", "training", "housing", "transport", "bike", "custom", "loan_deposit"]
  }),
  sponsorshipAmount: decimal("sponsorship_amount", { precision: 10, scale: 2 }),
  preferredPaymentMethod: varchar("preferred_payment_method", {
    enum: ["bank_transfer", "mpesa", "stripe"]
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Villagers table
export const otps = pgTable("otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar("identifier").notNull(), // Email or Phone
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOtpSchema = createInsertSchema(otps);
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otps.$inferSelect;

export const villagers = pgTable("villagers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  county: varchar("county").notNull().default("Kisii County"),
  constituency: varchar("constituency").notNull(),
  ward: varchar("ward").notNull(),
  story: text("story").notNull(),
  dream: text("dream"),
  profileImageUrl: varchar("profile_image_url"),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull().default("65000.00"),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { enum: ["available", "partially_funded", "fully_funded", "in_training", "active"] })
    .notNull().default("available"),
  // New fields for license and program tracks
  licenseType: varchar("license_type", {
    enum: ["none", "A", "B", "C", "D", "E", "F", "G"]
  }).notNull().default("none"),
  licenseImageUrl: varchar("license_image_url"),
  programType: varchar("program_type", { enum: ["standard", "bike_deposit", "nairobi_driver"] }).notNull().default("standard"),
  trainingProgress: integer("training_progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sponsorships table
export const sponsorships = pgTable("sponsorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => users.id).notNull(),
  villagerId: varchar("villager_id").references(() => villagers.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  sponsorshipType: varchar("sponsorship_type", {
    enum: ["full", "partial", "group"]
  }).notNull(),
  componentType: varchar("component_type", {
    enum: ["training", "housing", "transport", "bike", "full"]
  }),
  paymentStatus: varchar("payment_status", {
    enum: ["pending", "completed", "failed"]
  }).notNull().default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table for direct communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  villagerId: varchar("villager_id").references(() => villagers.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress updates table
export const progressUpdates = pgTable("progress_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  villagerId: varchar("villager_id").references(() => villagers.id).notNull(),
  phase: varchar("phase", {
    enum: ["training", "housing", "bike_deployment", "active"]
  }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  villagerProfile: one(villagers, {
    fields: [users.id],
    references: [villagers.userId],
  }),
  sponsorships: many(sponsorships),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const villagersRelations = relations(villagers, ({ one, many }) => ({
  user: one(users, {
    fields: [villagers.userId],
    references: [users.id],
  }),
  sponsorships: many(sponsorships),
  messages: many(messages),
  progressUpdates: many(progressUpdates),
}));

export const sponsorshipsRelations = relations(sponsorships, ({ one }) => ({
  sponsor: one(users, {
    fields: [sponsorships.sponsorId],
    references: [users.id],
  }),
  villager: one(villagers, {
    fields: [sponsorships.villagerId],
    references: [villagers.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  villager: one(villagers, {
    fields: [messages.villagerId],
    references: [villagers.id],
  }),
}));

export const progressUpdatesRelations = relations(progressUpdates, ({ one }) => ({
  villager: one(villagers, {
    fields: [progressUpdates.villagerId],
    references: [villagers.id],
  }),
}));

// Insert schemas
export const insertVillagerSchema = createInsertSchema(villagers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAmount: true,
  trainingProgress: true,
});

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  paymentStatus: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertProgressUpdateSchema = createInsertSchema(progressUpdates).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertVillager = z.infer<typeof insertVillagerSchema>;
export type Villager = typeof villagers.$inferSelect;
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertProgressUpdate = z.infer<typeof insertProgressUpdateSchema>;
export type ProgressUpdate = typeof progressUpdates.$inferSelect;
