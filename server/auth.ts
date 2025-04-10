import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { supabaseStorage as storage } from "./supabase-storage";
import { User as UserType, userRoleEnum } from "@shared/schema";
import { log } from "./vite";

// Define User type for TypeScript
type User = UserType;

declare global {
  namespace Express {
    // Define User interface to extend the User type from schema
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare stored password with supplied password
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Generate a secure random secret if not provided in env vars
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check for user by username
        const user = await storage.getUserByUsername(username);
        
        // If no user found or password doesn't match, return false
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        
        // Update last login time if needed
        // Commented out for now as last_login is not in the user schema
        // await storage.updateUser(user.id, { last_login: new Date() });
        
        // Return the authenticated user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Create profile based on user role
      if (user.role === "client") {
        await storage.createClientProfile({
          userId: user.id,
          totalSpent: "0"
        });
      } else if (user.role === "provider") {
        // Create provider profile
        await storage.createProviderProfile({
          userId: user.id,
          emergencySupport: false,
          dualExpertise: false,
          availability24_7: false,
          // Don't set verification status directly as it's not in the schema type
          documents_submitted: false,
          document_links: [],
          commission_rate: "26.00"
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // User login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: "Invalid username or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // User logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Failed to logout" });
      res.sendStatus(200);
    });
  });

  // Get current user info
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
  
  // Get user profile info (combines user data with profile data)
  app.get("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as User;
      
      if (user.role === "client") {
        const clientProfile = await storage.getClientProfile(user.id);
        const { password, ...userWithoutPassword } = user;
        res.json({
          user: userWithoutPassword,
          profile: clientProfile
        });
      } else if (user.role === "provider") {
        const providerProfile = await storage.getProviderProfile(user.id);
        const { password, ...userWithoutPassword } = user;
        res.json({
          user: userWithoutPassword,
          profile: providerProfile
        });
      } else {
        const { password, ...userWithoutPassword } = user;
        res.json({
          user: userWithoutPassword,
          profile: null
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update user information
  app.patch("/api/user", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as User;
      
      // Don't allow updating certain fields
      const { id, password, role, created_at, reset_token, reset_token_expires, verification_token, ...updatableFields } = req.body;
      
      const updatedUser = await storage.updateUser(user.id, {
        ...updatableFields
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      // Remove password from response
      const { password: pwd, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  // Update client profile
  app.patch("/api/user/client-profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as User;
      
      // Check if user is a client
      if (user.role !== "client") {
        return res.status(403).json({ error: "Only clients can update client profiles" });
      }
      
      // Don't allow updating certain fields
      const { id, userId, totalSpent, ...updatableFields } = req.body;
      
      const updatedProfile = await storage.updateClientProfile(user.id, updatableFields);
      
      if (!updatedProfile) {
        return res.status(500).json({ error: "Failed to update client profile" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });
  
  // Update provider profile
  app.patch("/api/user/provider-profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as User;
      
      // Check if user is a provider
      if (user.role !== "provider") {
        return res.status(403).json({ error: "Only providers can update provider profiles" });
      }
      
      // Don't allow updating certain protected fields
      const { 
        id, userId, totalBookings, verification_status, 
        commission_rate, ...updatableFields 
      } = req.body;
      
      const updatedProfile = await storage.updateProviderProfile(user.id, updatableFields);
      
      if (!updatedProfile) {
        return res.status(500).json({ error: "Failed to update provider profile" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

// Middleware to check if user has specific role
export function hasRole(role: "client" | "provider" | "admin") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user as User;
    if (user.role !== role) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    next();
  };
}