import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertVillagerSchema,
  insertSponsorshipSchema,
  insertMessageSchema,
  insertProgressUpdateSchema
} from "@shared/schema";

// Initialize Stripe only if credentials are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
  console.log('Stripe initialized successfully');
} else {
  console.warn('WARNING: Stripe not configured. Payment features will be disabled.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Setup multer for file uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  // Upload route
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
  });

  // Auth routes
  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { identifier } = req.body;
      if (!identifier) return res.status(400).json({ message: "Identifier (Email/Phone) is required" });

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await storage.createOtp({ identifier, code, expiresAt });

      const { sendOtp } = await import("./mailer");
      await sendOtp(identifier, code);

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { identifier, code } = req.body;
      if (!identifier || !code) return res.status(400).json({ message: "Identifier and code are required" });

      const otp = await storage.getOtp(identifier, code);
      if (!otp) return res.status(400).json({ message: "Invalid or expired OTP" });

      await storage.verifyOtp(otp.id);
      res.json({ success: true, otpId: otp.id });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Sponsor routes
  app.get('/api/sponsors/rankings', async (_req, res) => {
    try {
      const rankings = await storage.getSponsorRankings();
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching sponsor rankings:", error);
      res.status(500).json({ message: "Failed to fetch sponsor rankings" });
    }
  });

  // Villager routes
  app.get('/api/villagers', async (req, res) => {
    try {
      const villagers = await storage.getVillagers();
      res.json(villagers);
    } catch (error) {
      console.error("Error fetching villagers:", error);
      res.status(500).json({ message: "Failed to fetch villagers" });
    }
  });

  // Global Stats route
  app.get('/api/stats', async (_req, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({ message: "Failed to fetch global stats" });
    }
  });

  // Get villager profile for authenticated villager
  app.get('/api/villagers/profile', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = (req.user as any).id;
      const villager = await storage.getVillagerByUserId(userId);
      if (!villager) {
        return res.status(404).json({ message: "No villager profile found" });
      }
      res.json(villager);
    } catch (error) {
      console.error("Error fetching villager profile:", error);
      res.status(500).json({ message: "Failed to fetch villager profile" });
    }
  });

  app.get('/api/villagers/:id', async (req, res) => {
    try {
      const villager = await storage.getVillager(req.params.id);
      if (!villager) {
        return res.status(404).json({ message: "Villager not found" });
      }
      res.json(villager);
    } catch (error) {
      console.error("Error fetching villager:", error);
      res.status(500).json({ message: "Failed to fetch villager" });
    }
  });

  app.post('/api/villagers', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = (req.user as any).id;

      // Enforce 2000 slots limit
      const count = await storage.getVillagerCount();
      if (count >= 2000) {
        return res.status(403).json({ message: "No more sponsorship slots available for the 2024 cycle." });
      }

      // Determine target amount based on program type
      let targetAmount = "65000.00"; // Default standard amount
      if (req.body.programType === "bike_deposit") {
        targetAmount = "20000.00";
      }

      const validatedData = insertVillagerSchema.parse({
        ...req.body,
        userId,
        targetAmount, // Override defaults
      });

      const villager = await storage.createVillager(validatedData);
      res.status(201).json(villager);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating villager:", error);
      res.status(500).json({ message: "Failed to create villager" });
    }
  });

  app.put('/api/villagers/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = (req.user as any).id;
      const villager = await storage.getVillager(req.params.id);

      if (!villager) {
        return res.status(404).json({ message: "Villager not found" });
      }

      if (villager.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedVillager = await storage.updateVillager(req.params.id, req.body);
      res.json(updatedVillager);
    } catch (error) {
      console.error("Error updating villager:", error);
      res.status(500).json({ message: "Failed to update villager" });
    }
  });

  // Sponsorship routes
  app.post('/api/sponsorships', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const sponsorId = (req.user as any).id;
      const validatedData = insertSponsorshipSchema.parse({
        ...req.body,
        sponsorId,
      });

      const sponsorship = await storage.createSponsorship(validatedData);
      res.status(201).json(sponsorship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating sponsorship:", error);
      res.status(500).json({ message: "Failed to create sponsorship" });
    }
  });

  app.get('/api/my-sponsorships', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const sponsorId = (req.user as any).id;
      const sponsorships = await storage.getSponsorshipsBySponsor(sponsorId);
      res.json(sponsorships);
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
      res.status(500).json({ message: "Failed to fetch sponsorships" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!stripe) {
        return res.status(503).json({
          message: "Payment processing is not configured. Please contact the administrator."
        });
      }

      const { amount, villagerId, sponsorshipType, componentType } = req.body;
      const sponsorId = (req.user as any).id;

      if (!sponsorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100), // Convert to cents
        currency: "kes", // Kenyan Shillings
        metadata: {
          villagerId,
          sponsorId: sponsorId.toString(),
          sponsorshipType,
          componentType: componentType || 'full',
        },
      });

      // Create pending sponsorship
      await storage.createSponsorship({
        sponsorId,
        villagerId,
        amount: amount.toString(),
        sponsorshipType,
        componentType: componentType || 'full',
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook to handle payment confirmations
  app.post("/api/stripe-webhook", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({
        message: "Payment processing is not configured."
      });
    }

    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update sponsorship status
        const sponsorships = await storage.getSponsorshipsByVillager(
          paymentIntent.metadata.villagerId
        );

        const sponsorship = sponsorships.find(s => s.stripePaymentIntentId === paymentIntent.id);
        if (sponsorship) {
          await storage.updateSponsorshipPaymentStatus(
            sponsorship.id,
            'completed',
            paymentIntent.id
          );
        }
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Message routes
  app.post('/api/messages', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const senderId = (req.user as any).id;
      if (!senderId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });

      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/messages/:villagerId', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const messages = await storage.getMessages(req.params.villagerId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Progress routes
  app.post('/api/progress', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const validatedData = insertProgressUpdateSchema.parse(req.body);
      const update = await storage.createProgressUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating progress update:", error);
      res.status(500).json({ message: "Failed to create progress update" });
    }
  });

  app.get('/api/progress/:villagerId', async (req, res) => {
    try {
      const updates = await storage.getProgressUpdates(req.params.villagerId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching progress updates:", error);
      res.status(500).json({ message: "Failed to fetch progress updates" });
    }
  });

  // Debug route to clear database
  app.get('/api/debug/clear-db', async (_req, res) => {
    try {
      console.log("CLEANING DATABASE VIA DEBUG ROUTE...");
      const { villagers, users, sponsorships, messages, progressUpdates, sessions } = await import("@shared/schema");

      // Use storage methods or direct db deletes
      await db.delete(messages);
      await db.delete(progressUpdates);
      await db.delete(sponsorships);
      await db.delete(villagers);
      await db.delete(users);
      await db.delete(sessions);

      res.json({ message: "Database cleared successfully" });
    } catch (error: any) {
      console.error("Error clearing database:", error);
      res.status(500).json({ message: "Failed to clear database", error: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'chat') {
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
