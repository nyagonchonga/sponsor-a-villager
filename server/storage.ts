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
// Only import db when using DatabaseStorage
// import { db } from "./db";
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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private villagers = new Map<string, Villager>();
  private sponsorships = new Map<string, Sponsorship>();
  private messages = new Map<string, Message>();
  private progressUpdates = new Map<string, ProgressUpdate>();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      id: userData.id || crypto.randomUUID(),
      createdAt: this.users.get(userData.id!)?.createdAt || new Date(),
      updatedAt: new Date(),
      role: userData.role || "sponsor",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
    };
    this.users.set(user.id, user);
    return user;
  }

  // Villager operations
  async getVillagers(): Promise<Villager[]> {
    return Array.from(this.villagers.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getVillager(id: string): Promise<Villager | undefined> {
    return this.villagers.get(id);
  }

  async createVillager(villagerData: InsertVillager): Promise<Villager> {
    const villager: Villager = {
      ...villagerData,
      id: crypto.randomUUID(),
      userId: villagerData.userId || null,
      profileImageUrl: villagerData.profileImageUrl || null,
      currentAmount: "0.00",
      targetAmount: villagerData.targetAmount || "48000.00",
      status: villagerData.status || "available",
      trainingProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.villagers.set(villager.id, villager);
    return villager;
  }

  async updateVillager(id: string, updates: Partial<Villager>): Promise<Villager> {
    const villager = this.villagers.get(id);
    if (!villager) throw new Error("Villager not found");
    const updated = { ...villager, ...updates, updatedAt: new Date() };
    this.villagers.set(id, updated);
    return updated;
  }

  async getVillagerByUserId(userId: string): Promise<Villager | undefined> {
    return Array.from(this.villagers.values()).find(v => v.userId === userId);
  }

  // Sponsorship operations
  async createSponsorship(sponsorshipData: InsertSponsorship): Promise<Sponsorship> {
    const sponsorship: Sponsorship = {
      ...sponsorshipData,
      id: crypto.randomUUID(),
      paymentStatus: "pending",
      stripePaymentIntentId: sponsorshipData.stripePaymentIntentId || null,
      componentType: sponsorshipData.componentType || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sponsorships.set(sponsorship.id, sponsorship);

    // Update villager's current amount
    const villager = this.villagers.get(sponsorshipData.villagerId);
    if (villager) {
      const newAmount = parseFloat(villager.currentAmount) + parseFloat(sponsorshipData.amount as string);
      villager.currentAmount = newAmount.toFixed(2);
      villager.updatedAt = new Date();
      this.villagers.set(villager.id, villager);
    }

    return sponsorship;
  }

  async getSponsorshipsByVillager(villagerId: string): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).filter(s => s.villagerId === villagerId);
  }

  async getSponsorshipsBySponsor(sponsorId: string): Promise<(Sponsorship & { villager: Villager })[]> {
    const results: (Sponsorship & { villager: Villager })[] = [];
    for (const sponsorship of Array.from(this.sponsorships.values())) {
      if (sponsorship.sponsorId === sponsorId) {
        const villager = this.villagers.get(sponsorship.villagerId);
        if (villager) {
          results.push({ ...sponsorship, villager });
        }
      }
    }
    return results;
  }

  async updateSponsorshipPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<Sponsorship> {
    const sponsorship = this.sponsorships.get(id);
    if (!sponsorship) throw new Error("Sponsorship not found");
    sponsorship.paymentStatus = status as any;
    if (paymentIntentId) sponsorship.stripePaymentIntentId = paymentIntentId;
    sponsorship.updatedAt = new Date();
    this.sponsorships.set(id, sponsorship);
    return sponsorship;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getMessages(villagerId: string): Promise<(Message & { sender: User; receiver: User })[]> {
    const results: (Message & { sender: User; receiver: User })[] = [];
    for (const message of Array.from(this.messages.values())) {
      if (message.villagerId === villagerId) {
        const sender = this.users.get(message.senderId);
        const receiver = this.users.get(message.receiverId);
        if (sender && receiver) {
          results.push({ ...message, sender, receiver });
        }
      }
    }
    return results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
    }
  }

  // Progress operations
  async createProgressUpdate(updateData: InsertProgressUpdate): Promise<ProgressUpdate> {
    const update: ProgressUpdate = {
      ...updateData,
      id: crypto.randomUUID(),
      imageUrl: updateData.imageUrl || null,
      progress: updateData.progress || 0,
      createdAt: new Date(),
    };
    this.progressUpdates.set(update.id, update);
    return update;
  }

  async getProgressUpdates(villagerId: string): Promise<ProgressUpdate[]> {
    return Array.from(this.progressUpdates.values())
      .filter(u => u.villagerId === villagerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateVillagerProgress(villagerId: string, progress: number): Promise<Villager> {
    const villager = this.villagers.get(villagerId);
    if (!villager) throw new Error("Villager not found");
    villager.trainingProgress = progress;
    villager.updatedAt = new Date();
    this.villagers.set(villagerId, villager);
    return villager;
  }
}

// Use MemStorage instead of DatabaseStorage to avoid database connection issues
export const storage = new MemStorage();
