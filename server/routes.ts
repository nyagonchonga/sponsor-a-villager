import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertVillagerSchema, 
  insertSponsorshipSchema, 
  insertMessageSchema,
  insertProgressUpdateSchema 
} from "@shared/schema";

// Extend Express types for authenticated user
declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

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
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // Get villager profile for authenticated villager (must come before :id route)
  app.get('/api/villagers/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

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

  app.post('/api/villagers', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertVillagerSchema.parse({
        ...req.body,
        userId,
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

  app.put('/api/villagers/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims.sub;
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
  app.post('/api/sponsorships', isAuthenticated, async (req, res) => {
    try {
      const sponsorId = req.user?.claims.sub;
      if (!sponsorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

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

  app.get('/api/my-sponsorships', isAuthenticated, async (req, res) => {
    try {
      const sponsorId = req.user?.claims.sub;
      if (!sponsorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const sponsorships = await storage.getSponsorshipsBySponsor(sponsorId);
      res.json(sponsorships);
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
      res.status(500).json({ message: "Failed to fetch sponsorships" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not configured. Please contact the administrator." 
        });
      }

      const { amount, villagerId, sponsorshipType, componentType } = req.body;
      const sponsorId = req.user?.claims.sub;
      
      if (!sponsorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100), // Convert to cents
        currency: "kes", // Kenyan Shillings
        metadata: {
          villagerId,
          sponsorId,
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
  app.post('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const senderId = req.user?.claims.sub;
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

  app.get('/api/messages/:villagerId', isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.villagerId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Progress routes
  app.post('/api/progress', isAuthenticated, async (req, res) => {
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
