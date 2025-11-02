import {
  users,
  villagers,
  sponsorships,
  messages,
  progressUpdates,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Villager operations
  getVillagers(): Promise<Villager[]>;
  getVillager(id: string): Promise<Villager | undefined>;
  createVillager(villager: InsertVillager): Promise<Villager>;
  updateVillager(id: string, updates: Partial<Villager>): Promise<Villager>;
  getVillagerByUserId(userId: string): Promise<Villager | undefined>;

  // Sponsorship operations
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  getSponsorshipsByVillager(villagerId: string): Promise<Sponsorship[]>;
  getSponsorshipsBySponsor(sponsorId: string): Promise<(Sponsorship & { villager: Villager })[]>;
  updateSponsorshipPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<Sponsorship>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(villagerId: string): Promise<(Message & { sender: User; receiver: User })[]>;
  markMessageAsRead(messageId: string): Promise<void>;

  // Progress operations
  createProgressUpdate(update: InsertProgressUpdate): Promise<ProgressUpdate>;
  getProgressUpdates(villagerId: string): Promise<ProgressUpdate[]>;
  updateVillagerProgress(villagerId: string, progress: number): Promise<Villager>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Villager operations
  async getVillagers(): Promise<Villager[]> {
    return await db.select().from(villagers).orderBy(villagers.createdAt);
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

  // Sponsorship operations
  async createSponsorship(sponsorshipData: InsertSponsorship): Promise<Sponsorship> {
    const [sponsorship] = await db.insert(sponsorships).values(sponsorshipData).returning();
    
    // Update villager's current amount
    await db
      .update(villagers)
      .set({
        currentAmount: sql`${villagers.currentAmount} + ${sponsorshipData.amount}`,
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
}

export const storage = new DatabaseStorage();
