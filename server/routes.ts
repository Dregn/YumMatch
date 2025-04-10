import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseStorage as storage } from "./supabase-storage";
import { insertBookingSchema, userRoleEnum } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, hasRole } from "./auth";
import { log } from "./vite";
import { setupSupabaseTables, setupSupabaseFunction } from "./supabase-setup";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup database endpoint
  app.post("/api/setup/database", async (req, res) => {
    try {
      log("Setting up Supabase functions...", "info");
      await setupSupabaseFunction();
      
      log("Setting up Supabase tables...", "info");
      await setupSupabaseTables();
      
      res.json({ 
        success: true, 
        message: "Database setup completed successfully" 
      });
    } catch (error) {
      log(`Error setting up database: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Setup authentication
  setupAuth(app);
  
  // API routes
  app.get("/api/chefs", async (req, res) => {
    try {
      const cuisine = req.query.cuisine as string;
      const chefs = cuisine 
        ? await storage.getChefsByCuisine(cuisine)
        : await storage.getAllChefs();
      res.json(chefs);
    } catch (error) {
      log(`Error fetching chefs: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch chefs" });
    }
  });

  app.get("/api/chefs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid chef ID" });
      }
      
      const chef = await storage.getChefById(id);
      if (!chef) {
        return res.status(404).json({ message: "Chef not found" });
      }
      
      res.json(chef);
    } catch (error) {
      log(`Error fetching chef: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch chef" });
    }
  });

  app.get("/api/menus", async (req, res) => {
    try {
      const menus = await storage.getAllMenus();
      res.json(menus);
    } catch (error) {
      log(`Error fetching menus: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch menus" });
    }
  });

  app.get("/api/menus/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      
      const menu = await storage.getMenuById(id);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      
      res.json(menu);
    } catch (error) {
      log(`Error fetching menu: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  // Bookings routes
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: error.errors 
        });
      }
      log(`Error creating booking: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      log(`Error fetching bookings: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  app.get("/api/bookings/client", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore - req.user is defined by Passport
      const userId = req.user.id;
      const bookings = await storage.getBookingsByClient(userId);
      res.json(bookings);
    } catch (error) {
      log(`Error fetching client bookings: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch client bookings" });
    }
  });
  
  app.get("/api/bookings/provider", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      // @ts-ignore - req.user is defined by Passport
      const userId = req.user.id;
      const bookings = await storage.getBookingsByProvider(userId);
      res.json(bookings);
    } catch (error) {
      log(`Error fetching provider bookings: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });
  
  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      log(`Error updating booking status: ${error instanceof Error ? error.message : String(error)}`, "error");
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
