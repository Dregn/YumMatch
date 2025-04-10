import {
  users, type User, type InsertUser,
  chefs, type Chef, type InsertChef,
  menus, type Menu, type InsertMenu,
  bookings, type Booking, type InsertBooking,
  clientProfiles, type ClientProfile, type InsertClientProfile,
  providerProfiles, type ProviderProfile, type InsertProviderProfile,
  services, type Service, type InsertService,
  reviews, type Review, type InsertReview,
  savedProviders, type InsertGiftCard, giftCards,
  messages, type Message, type InsertMessage,
  subscriptions, type InsertGiftCard as GiftCard,
  badges, providerBadges, complaints, referrals
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, and, or, not, isNull, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import crypto from "crypto";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session management
  sessionStore: any; // Using any for session store to avoid type issues

  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Client profiles
  getClientProfile(userId: number): Promise<ClientProfile | undefined>;
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  updateClientProfile(userId: number, profileData: Partial<InsertClientProfile>): Promise<ClientProfile | undefined>;
  
  // Provider profiles
  getProviderProfile(userId: number): Promise<ProviderProfile | undefined>;
  createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile>;
  updateProviderProfile(userId: number, profileData: Partial<InsertProviderProfile>): Promise<ProviderProfile | undefined>;
  getAllProviderProfiles(): Promise<ProviderProfile[]>;
  getProvidersByFilters(filters: ProviderFilters): Promise<ProviderProfile[]>;
  
  // Services
  getServicesByProvider(providerId: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Chef management (legacy)
  getAllChefs(): Promise<Chef[]>;
  getChefById(id: number): Promise<Chef | undefined>;
  getChefsByCuisine(cuisine: string): Promise<Chef[]>;
  createChef(chef: InsertChef): Promise<Chef>;
  
  // Menu management
  getAllMenus(): Promise<Menu[]>;
  getMenuById(id: number): Promise<Menu | undefined>;
  getMenusByChef(chefId: number): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  
  // Booking management
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByClient(clientId: number): Promise<Booking[]>;
  getBookingsByProvider(providerId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProvider(providerId: number): Promise<Review[]>;
  getReviewsByClient(clientId: number): Promise<Review[]>;
  
  // Saved providers
  saveProvider(clientId: number, providerId: number): Promise<boolean>;
  unsaveProvider(clientId: number, providerId: number): Promise<boolean>;
  getSavedProviders(clientId: number): Promise<User[]>;
  
  // Messaging
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  markMessageAsRead(messageId: number): Promise<boolean>;
  
  // Gift cards
  createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard>;
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  redeemGiftCard(code: string, userId: number): Promise<boolean>;
}

interface ProviderFilters {
  cuisine?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  emergencySupport?: boolean;
  dualExpertise?: boolean;
  availability24_7?: boolean;
  searchTerm?: string;
  sortBy?: 'popular' | 'price_low' | 'price_high' | 'rating' | 'experience' | 'bookings';
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store type
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Seed initial data if needed
    try {
      this.seedInitialData();
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
  
  private async seedInitialData() {
    try {
      await this.seedChefs();
      await this.seedMenus();
    } catch (error) {
      console.error('Error in seedInitialData:', error);
    }
  }

  private async seedChefs() {
    try {
      // Check if we have chefs already
      const existingChefs = await db.select().from(chefs);
      if (existingChefs.length === 0) {
        // Add initial chefs
        await db.insert(chefs).values([
          {
            name: "Chef Marco",
            profileImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "Italian Cuisine",
            price: 60,
            description: "Specializing in authentic Italian cuisine with 10+ years experience in Michelin-starred restaurants.",
            rating: "4.9",
            reviewCount: 24
          },
          {
            name: "Chef Sophia",
            profileImage: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "French Cuisine",
            price: 75,
            description: "Classically trained in French cuisine with a modern twist. Expert in creating elegant dining experiences.",
            rating: "5.0",
            reviewCount: 36
          },
          {
            name: "Chef Raj",
            profileImage: "https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "Indian Cuisine",
            price: 55,
            description: "Expert in authentic Indian flavors with contemporary presentation. Creates personalized spice blends.",
            rating: "4.8",
            reviewCount: 19
          },
          {
            name: "Chef Yuki",
            profileImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "Japanese Cuisine",
            price: 80,
            description: "Sushi master with expertise in traditional and fusion Japanese cuisine. Known for artistic presentation.",
            rating: "4.9",
            reviewCount: 28
          },
          {
            name: "Chef Elena",
            profileImage: "https://images.unsplash.com/photo-1607631568010-a87245c0dbd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "Mediterranean Cuisine",
            price: 65,
            description: "Mediterranean cuisine expert focusing on fresh, healthy ingredients. Specializes in Greek and Spanish dishes.",
            rating: "4.7",
            reviewCount: 22
          },
          {
            name: "Chef Thomas",
            profileImage: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            cuisine: "Modern European",
            price: 90,
            description: "Contemporary European cuisine with molecular gastronomy techniques. Creates immersive dining experiences.",
            rating: "4.8",
            reviewCount: 31
          }
        ]);
      }
    } catch (error) {
      console.error('Error seeding chefs:', error);
    }
  }

  private async seedMenus() {
    try {
      // Check if we have menus already
      const existingMenus = await db.select().from(menus);
      if (existingMenus.length === 0) {
        // Add initial menus
        await db.insert(menus).values([
          {
            name: "Italian Feast",
            image: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            description: "A traditional Italian dining experience featuring handmade pasta, authentic sauces, and classic desserts.",
            courses: "3 courses",
            guestRange: "4-12 guests",
            price: 55,
            items: [
              "Antipasti selection with cured meats and cheeses",
              "Fresh handmade pasta with choice of sauces",
              "Traditional tiramisu or panna cotta"
            ]
          },
          {
            name: "Asian Fusion",
            image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            description: "A creative blend of flavors from across Asia, combining traditional techniques with modern presentation.",
            courses: "4 courses",
            guestRange: "4-10 guests",
            price: 70,
            items: [
              "Selection of dumplings and spring rolls",
              "Sushi platter and steamed bao buns",
              "Miso glazed black cod or teriyaki beef"
            ]
          },
          {
            name: "Mediterranean Tapas",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
            description: "A social dining experience featuring a variety of small plates inspired by Mediterranean coastal cuisine.",
            courses: "Multiple small plates",
            guestRange: "6-15 guests",
            price: 60,
            items: [
              "Greek mezze with hummus and tzatziki",
              "Spanish tapas including patatas bravas",
              "Seafood paella and grilled vegetables"
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error seeding menus:', error);
    }
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  // Client profiles
  async getClientProfile(userId: number): Promise<ClientProfile | undefined> {
    const [profile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, userId));
    return profile;
  }
  
  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const [clientProfile] = await db
      .insert(clientProfiles)
      .values(profile)
      .returning();
    return clientProfile;
  }
  
  async updateClientProfile(userId: number, profileData: Partial<InsertClientProfile>): Promise<ClientProfile | undefined> {
    const [profile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, userId));
      
    if (!profile) return undefined;
    
    const [updatedProfile] = await db
      .update(clientProfiles)
      .set(profileData)
      .where(eq(clientProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  // Provider profiles
  async getProviderProfile(userId: number): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, userId));
    return profile;
  }
  
  async createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile> {
    const [providerProfile] = await db
      .insert(providerProfiles)
      .values(profile)
      .returning();
    return providerProfile;
  }
  
  async updateProviderProfile(userId: number, profileData: Partial<InsertProviderProfile>): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, userId));
      
    if (!profile) return undefined;
    
    const [updatedProfile] = await db
      .update(providerProfiles)
      .set(profileData)
      .where(eq(providerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  async getAllProviderProfiles(): Promise<ProviderProfile[]> {
    return db.select().from(providerProfiles);
  }
  
  async getProvidersByFilters(filters: ProviderFilters): Promise<ProviderProfile[]> {
    let query = db.select({
      profile: providerProfiles,
      user: users
    })
    .from(providerProfiles)
    .innerJoin(users, eq(providerProfiles.userId, users.id));
    
    // Apply filters
    const conditions = [];
    
    if (filters.cuisine) {
      conditions.push(like(providerProfiles.cuisineSpecialty, `%${filters.cuisine}%`));
    }
    
    if (filters.location) {
      conditions.push(like(users.location, `%${filters.location}%`));
    }
    
    if (filters.minPrice && filters.minPrice > 0) {
      conditions.push(sql`${providerProfiles.hourlyRate} >= ${filters.minPrice}`);
    }
    
    if (filters.maxPrice && filters.maxPrice > 0) {
      conditions.push(sql`${providerProfiles.hourlyRate} <= ${filters.maxPrice}`);
    }
    
    if (filters.emergencySupport) {
      conditions.push(eq(providerProfiles.emergencySupport, true));
    }
    
    if (filters.dualExpertise) {
      conditions.push(eq(providerProfiles.dualExpertise, true));
    }
    
    if (filters.availability24_7) {
      conditions.push(eq(providerProfiles.availability24_7, true));
    }
    
    if (filters.searchTerm) {
      conditions.push(
        or(
          like(users.fullname, `%${filters.searchTerm}%`),
          like(users.bio, `%${filters.searchTerm}%`),
          like(providerProfiles.cuisineSpecialty, `%${filters.searchTerm}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'popular':
          query = query.orderBy(desc(providerProfiles.totalBookings));
          break;
        case 'price_low':
          query = query.orderBy(providerProfiles.hourlyRate);
          break;
        case 'price_high':
          query = query.orderBy(desc(providerProfiles.hourlyRate));
          break;
        case 'experience':
          query = query.orderBy(desc(providerProfiles.yearsExperience));
          break;
        case 'bookings':
          query = query.orderBy(desc(providerProfiles.totalBookings));
          break;
      }
    }
    
    const results = await query;
    return results.map(r => r.profile);
  }
  
  // Services
  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .where(eq(services.providerId, providerId));
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return service;
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }
  
  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    const result = await db
      .delete(services)
      .where(eq(services.id, id));
    return result.rowCount > 0;
  }
  
  // Chef management (legacy)
  async getAllChefs(): Promise<Chef[]> {
    return db.select().from(chefs);
  }
  
  async getChefById(id: number): Promise<Chef | undefined> {
    const [chef] = await db
      .select()
      .from(chefs)
      .where(eq(chefs.id, id));
    return chef;
  }
  
  async getChefsByCuisine(cuisine: string): Promise<Chef[]> {
    if (!cuisine || cuisine === 'all') {
      return this.getAllChefs();
    }
    return db
      .select()
      .from(chefs)
      .where(like(chefs.cuisine, `%${cuisine}%`));
  }
  
  async createChef(chef: InsertChef): Promise<Chef> {
    const [newChef] = await db
      .insert(chefs)
      .values(chef)
      .returning();
    return newChef;
  }
  
  // Menu management
  async getAllMenus(): Promise<Menu[]> {
    return db.select().from(menus);
  }
  
  async getMenuById(id: number): Promise<Menu | undefined> {
    const [menu] = await db
      .select()
      .from(menus)
      .where(eq(menus.id, id));
    return menu;
  }
  
  async getMenusByChef(chefId: number): Promise<Menu[]> {
    return db
      .select()
      .from(menus)
      .where(eq(menus.chefId, chefId));
  }
  
  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [newMenu] = await db
      .insert(menus)
      .values(menu)
      .returning();
    return newMenu;
  }
  
  // Booking management
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
      
    // Update provider's total bookings
    if (newBooking.providerId) {
      const [providerProfile] = await db
        .select()
        .from(providerProfiles)
        .where(eq(providerProfiles.userId, newBooking.providerId));
        
      if (providerProfile) {
        await db
          .update(providerProfiles)
          .set({ totalBookings: providerProfile.totalBookings + 1 })
          .where(eq(providerProfiles.userId, newBooking.providerId));
      }
    }
    
    return newBooking;
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.clientId, clientId));
  }
  
  async getBookingsByProvider(providerId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.providerId, providerId));
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ 
        status: status as any,
        updated_at: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }
  
  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }
  
  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.providerId, providerId));
  }
  
  async getReviewsByClient(clientId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.clientId, clientId));
  }
  
  // Saved providers
  async saveProvider(clientId: number, providerId: number): Promise<boolean> {
    try {
      await db
        .insert(savedProviders)
        .values({ clientId, providerId })
        .onConflictDoNothing();
      return true;
    } catch (error) {
      console.error('Error saving provider:', error);
      return false;
    }
  }
  
  async unsaveProvider(clientId: number, providerId: number): Promise<boolean> {
    const result = await db
      .delete(savedProviders)
      .where(
        and(
          eq(savedProviders.clientId, clientId),
          eq(savedProviders.providerId, providerId)
        )
      );
    return result.rowCount > 0;
  }
  
  async getSavedProviders(clientId: number): Promise<User[]> {
    const saved = await db
      .select({
        providerId: savedProviders.providerId
      })
      .from(savedProviders)
      .where(eq(savedProviders.clientId, clientId));
    
    if (saved.length === 0) return [];
    
    const providerIds = saved.map(s => s.providerId);
    return db
      .select()
      .from(users)
      .where(sql`${users.id} IN (${providerIds.join(',')})`);
  }
  
  // Messaging
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.recipientId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.recipientId, user1Id)
          )
        )
      )
      .orderBy(messages.sent_at);
  }
  
  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.is_read, false)
        )
      );
    return result[0]?.count || 0;
  }
  
  async markMessageAsRead(messageId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ 
        is_read: true,
        read_at: new Date()
      })
      .where(eq(messages.id, messageId));
    return result.rowCount > 0;
  }
  
  // Gift cards
  async createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard> {
    const code = crypto.randomBytes(8).toString('hex');
    const [newGiftCard] = await db
      .insert(giftCards)
      .values({
        ...giftCard,
        code
      })
      .returning();
    return newGiftCard;
  }
  
  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    const [giftCard] = await db
      .select()
      .from(giftCards)
      .where(eq(giftCards.code, code));
    return giftCard;
  }
  
  async redeemGiftCard(code: string, userId: number): Promise<boolean> {
    const [giftCard] = await db
      .select()
      .from(giftCards)
      .where(
        and(
          eq(giftCards.code, code),
          eq(giftCards.isRedeemed, false)
        )
      );
      
    if (!giftCard) return false;
    
    const result = await db
      .update(giftCards)
      .set({ 
        isRedeemed: true,
        redeemerId: userId,
        redeemed_at: new Date()
      })
      .where(eq(giftCards.id, giftCard.id));
      
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
