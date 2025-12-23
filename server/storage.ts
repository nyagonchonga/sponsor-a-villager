import {
  users,
  villagers,
  sponsorships,
  messages,
  progressUpdates,
  otps,
  type User,
  type UpsertUser,
  type Villager,
  type InsertVillager,
  type Sponsorship,
  type InsertSponsorship,
  type Message,
  type InsertMessage,
  type ProgressUpdate,
  type InsertProgressUpdate,
  type Otp,
  type InsertOtp,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>; // Keeping for compatibility

  // Villager operations
  getVillagers(): Promise<Villager[]>;
  getVillager(id: string): Promise<Villager | undefined>;
  createVillager(villager: InsertVillager): Promise<Villager>;
  updateVillager(id: string, updates: Partial<Villager>): Promise<Villager>;
  getVillagerByUserId(userId: string): Promise<Villager | undefined>;
  getVillagerCount(): Promise<number>;
  getNextAvailableVillager(): Promise<Villager | undefined>;

  // Sponsorship operations
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  getSponsorshipsByVillager(villagerId: string): Promise<Sponsorship[]>;
  getSponsorshipsBySponsor(sponsorId: string): Promise<(Sponsorship & { villager: Villager })[]>;
  updateSponsorshipPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<Sponsorship>;
  getSponsorRankings(): Promise<{ name: string; totalAmount: string; rank: number }[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(villagerId: string): Promise<(Message & { sender: User; receiver: User })[]>;
  markMessageAsRead(messageId: string): Promise<void>;

  // Progress operations
  createProgressUpdate(update: InsertProgressUpdate): Promise<ProgressUpdate>;
  getProgressUpdates(villagerId: string): Promise<ProgressUpdate[]>;
  updateVillagerProgress(villagerId: string, progress: number): Promise<Villager>;
  // Stats operations
  getGlobalStats(): Promise<{
    totalSponsors: number;
    totalVillagers: number;
    activeRiders: number;
    totalRaised: string;
    familiesImpacted: number;
  }>;

  // OTP methods
  createOtp(otp: InsertOtp): Promise<Otp>;
  getOtp(identifier: string, code: string): Promise<Otp | undefined>;
  verifyOtp(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (pool) {
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true,
      });
    } else {
      this.sessionStore = new session.MemoryStore();
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.createUser(userData);
  }

  // OTP implementations
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    const [otp] = await db.insert(otps).values(insertOtp).returning();
    return otp;
  }

  async getOtp(identifier: string, code: string): Promise<Otp | undefined> {
    const [otp] = await db.select()
      .from(otps)
      .where(
        and(
          eq(otps.identifier, identifier),
          eq(otps.code, code),
          eq(otps.verified, false),
          sql`${otps.expiresAt} > NOW()`
        )
      )
      .limit(1);
    return otp;
  }

  async verifyOtp(id: string): Promise<void> {
    await db.update(otps)
      .set({ verified: true })
      .where(eq(otps.id, id));
  }

  // Villager operations
  async getVillagers(): Promise<Villager[]> {
    return await db.select().from(villagers).orderBy(desc(villagers.createdAt));
  }

  async getVillager(id: string): Promise<Villager | undefined> {
    const [villager] = await db.select().from(villagers).where(eq(villagers.id, id));
    return villager;
  }

  async createVillager(villagerData: InsertVillager): Promise<Villager> {
    const [villager] = await db.insert(villagers).values(villagerData).returning();
    return villager;
  }

  async updateVillager(id: string, updates: Partial<Villager>): Promise<Villager> {
    const [villager] = await db
      .update(villagers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(villagers.id, id))
      .returning();
    return villager;
  }

  async getVillagerByUserId(userId: string): Promise<Villager | undefined> {
    const [villager] = await db.select().from(villagers).where(eq(villagers.userId, userId));
    return villager;
  }

  async getVillagerCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(villagers);
    return Number(result.count);
  }

  async getNextAvailableVillager(): Promise<Villager | undefined> {
    // Get villagers who need funding, ordered by creation time (priority slots)
    const [villager] = await db
      .select()
      .from(villagers)
      .where(sql`CAST(${villagers.currentAmount} AS DECIMAL) < CAST(${villagers.targetAmount} AS DECIMAL)`)
      .orderBy(villagers.createdAt)
      .limit(1);
    return villager;
  }

  // Sponsorship operations
  async createSponsorship(sponsorshipData: InsertSponsorship): Promise<Sponsorship> {
    const [sponsorship] = await db.insert(sponsorships).values(sponsorshipData).returning();

    // Update villager's current amount
    await db
      .update(villagers)
      .set({
        currentAmount: sql`${villagers.currentAmount} + ${sponsorshipData.amount} `,
        updatedAt: new Date(),
      })
      .where(eq(villagers.id, sponsorshipData.villagerId));

    return sponsorship;
  }

  async getSponsorshipsByVillager(villagerId: string): Promise<Sponsorship[]> {
    return await db.select().from(sponsorships).where(eq(sponsorships.villagerId, villagerId));
  }

  async getSponsorshipsBySponsor(sponsorId: string): Promise<(Sponsorship & { villager: Villager })[]> {
    return await db
      .select()
      .from(sponsorships)
      .innerJoin(villagers, eq(sponsorships.villagerId, villagers.id))
      .where(eq(sponsorships.sponsorId, sponsorId))
      .then(results => results.map(row => ({ ...row.sponsorships, villager: row.villagers })));
  }

  async updateSponsorshipPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<Sponsorship> {
    const [sponsorship] = await db
      .update(sponsorships)
      .set({
        paymentStatus: status as any,
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(sponsorships.id, id))
      .returning();
    return sponsorship;
  }

  async getSponsorRankings(): Promise<{ name: string; totalAmount: string; rank: number }[]> {
    const results = await db
      .select({
        name: sql<string>`${users.firstName} || ' ' || ${users.lastName} `,
        totalAmount: sql<string>`sum(${sponsorships.amount}):: text`,
      })
      .from(sponsorships)
      .innerJoin(users, eq(sponsorships.sponsorId, users.id))
      .where(eq(sponsorships.paymentStatus, 'completed'))
      .groupBy(users.id, users.firstName, users.lastName)
      .orderBy(desc(sql`sum(${sponsorships.amount})`))
      .limit(10);

    return results.map((r, i) => ({
      ...r,
      rank: i + 1,
    }));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getMessages(villagerId: string): Promise<(Message & { sender: User; receiver: User })[]> {
    return await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.villagerId, villagerId))
      .orderBy(desc(messages.createdAt))
      .then(results => results.map(row => ({
        ...row.messages,
        sender: row.users,
        receiver: row.users // This would need a second join for receiver
      })));
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Progress operations
  async createProgressUpdate(updateData: InsertProgressUpdate): Promise<ProgressUpdate> {
    const [update] = await db.insert(progressUpdates).values(updateData).returning();
    return update;
  }

  async getProgressUpdates(villagerId: string): Promise<ProgressUpdate[]> {
    return await db
      .select()
      .from(progressUpdates)
      .where(eq(progressUpdates.villagerId, villagerId))
      .orderBy(desc(progressUpdates.createdAt));
  }

  async updateVillagerProgress(villagerId: string, progress: number): Promise<Villager> {
    const [villager] = await db
      .update(villagers)
      .set({
        trainingProgress: progress,
        updatedAt: new Date(),
      })
      .where(eq(villagers.id, villagerId))
      .returning();
    return villager;
  }
  async getGlobalStats(): Promise<{
    totalSponsors: number;
    totalVillagers: number;
    activeRiders: number;
    totalRaised: string;
    familiesImpacted: number;
  }> {
    const [sponsorCountResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .where(eq(users.role, 'sponsor'));

    const [villagerCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(villagers);

    const [activeRidersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(villagers)
      .where(sql`${villagers.trainingProgress} >= 75`);

    const [totalRaisedResult] = await db
      .select({ total: sql<string>`coalesce(sum(${sponsorships.amount}), 0):: text` })
      .from(sponsorships)
      .where(eq(sponsorships.paymentStatus, 'completed'));

    const totalVillagers = Number(villagerCountResult.count);

    return {
      totalSponsors: Number(sponsorCountResult.count),
      totalVillagers: totalVillagers,
      activeRiders: Number(activeRidersResult.count),
      totalRaised: totalRaisedResult.total,
      familiesImpacted: totalVillagers * 4,
    };
  }
}

// Export database storage instance
export const storage = new DatabaseStorage();
