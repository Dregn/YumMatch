import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date, pgEnum, numeric, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["client", "provider", "admin"]);
export const subscriptionTypeEnum = pgEnum("subscription_type", ["free", "basic", "premium", "professional"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "completed", "cancelled"]);
export const providerVerificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);

// Users table - expanded for both clients and providers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullname: text("fullname").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").default("client").notNull(),
  profileImage: text("profile_image"),
  bio: text("bio"),
  location: text("location"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  last_login: timestamp("last_login"),
  reset_token: text("reset_token"),
  reset_token_expires: timestamp("reset_token_expires"),
  is_verified: boolean("is_verified").default(false),
  verification_token: text("verification_token"),
});

// Forward declare clientProfiles type
export let clientProfilesTable: any;

// Client-specific profile information
export const clientProfiles = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  preferences: text("preferences"),
  paymentMethods: text("payment_methods"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => clientProfilesTable ?? (clientProfilesTable = clientProfiles), { onDelete: "set null" }),
  totalSpent: numeric("total_spent").default("0").notNull(),
});

// Provider-specific profile information
export const providerProfiles = pgTable("provider_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  cuisineSpecialty: text("cuisine_specialty"),
  yearsExperience: integer("years_experience"),
  hourlyRate: numeric("hourly_rate"),
  availability: text("availability"), // JSON string of availability times
  emergencySupport: boolean("emergency_support").default(false),
  dualExpertise: boolean("dual_expertise").default(false),
  availability24_7: boolean("availability_24_7").default(false),
  totalBookings: integer("total_bookings").default(0),
  verificationStatus: providerVerificationStatusEnum("verification_status").default("pending"),
  documentsSubmitted: boolean("documents_submitted").default(false),
  documentLinks: text("document_links").array(), // Array of document URLs
  commissionRate: numeric("commission_rate").default("26.00"),
});

// Services offered by providers
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  duration: integer("duration"), // In minutes
  isVideoConsultation: boolean("is_video_consultation").default(false),
  isFaceToFace: boolean("is_face_to_face").default(true),
});

// Achievements/Badges for providers
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"),
  criteria: text("criteria"),
});

// Join table for providers and their badges
export const providerBadges = pgTable("provider_badges", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
}, (table) => {
  return {
    providerBadgeUnique: uniqueIndex("provider_badge_unique").on(table.providerId, table.badgeId),
  }
});

// Chefs table (maintained for backward compatibility)
export const chefs = pgTable("chefs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  profileImage: text("profile_image").notNull(),
  cuisine: text("cuisine").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  rating: text("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  providerId: integer("provider_id").references(() => providerProfiles.id),
});

// Menus offered by chefs
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  chefId: integer("chef_id").references(() => chefs.id),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  courses: text("courses").notNull(),
  guestRange: text("guest_range").notNull(),
  price: integer("price").notNull(),
  items: text("items").array().notNull(),
});

// Bookings/Appointments
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id),
  providerId: integer("provider_id").references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  eventType: text("event_type").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  endTime: text("end_time"),
  guests: integer("guests"),
  cuisine: text("cuisine"),
  location: text("location").notNull(),
  specialRequests: text("special_requests"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  totalAmount: numeric("total_amount"),
  clientFee: numeric("client_fee"),
  providerCommission: numeric("provider_commission"),
  paymentStatus: text("payment_status").default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews and Ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Saved/Bookmarked Providers
export const savedProviders = pgTable("saved_providers", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  saved_at: timestamp("saved_at").defaultNow().notNull(),
}, (table) => {
  return {
    clientProviderUnique: uniqueIndex("client_provider_unique").on(table.clientId, table.providerId),
  }
});

// Messaging system
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  is_read: boolean("is_read").default(false),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  read_at: timestamp("read_at"),
});

// Subscriptions/Memberships
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  type: subscriptionTypeEnum("type").default("free").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  autoRenew: boolean("auto_renew").default(false),
  paymentId: text("payment_id"),
  amount: numeric("amount"),
  interval: text("interval"), // monthly, yearly, etc.
});

// Gift Cards
export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  amount: numeric("amount").notNull(),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemerId: integer("redeemer_id").references(() => users.id),
  purchaserId: integer("purchaser_id").references(() => users.id),
  expiryDate: timestamp("expiry_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  redeemed_at: timestamp("redeemed_at"),
  occasion: text("occasion"),
  message: text("message"),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  status: text("status").default("pending"),
  reward: numeric("reward"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  converted_at: timestamp("converted_at"),
});

// Complaints
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  resolved_at: timestamp("resolved_at"),
});

// Define relations
export const userRelations = relations(users, ({ one, many }) => ({
  clientProfile: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.userId]
  }),
  providerProfile: one(providerProfiles, {
    fields: [users.id],
    references: [providerProfiles.userId]
  }),
  bookingsAsClient: many(bookings, { relationName: "client_bookings" }),
  bookingsAsProvider: many(bookings, { relationName: "provider_bookings" }),
  reviews: many(reviews),
  messages: many(messages, { relationName: "sent_messages" }),
  receivedMessages: many(messages, { relationName: "received_messages" }),
  subscription: one(subscriptions),
}));

export const clientProfileRelations = relations(clientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [clientProfiles.userId],
    references: [users.id]
  }),
  savedProviders: many(savedProviders),
}));

export const providerProfileRelations = relations(providerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [providerProfiles.userId],
    references: [users.id]
  }),
  services: many(services),
  badges: many(providerBadges),
  chef: one(chefs, {
    fields: [providerProfiles.id],
    references: [chefs.providerId]
  }),
}));

export const serviceRelations = relations(services, ({ one }) => ({
  provider: one(providerProfiles, {
    fields: [services.providerId],
    references: [providerProfiles.id]
  }),
}));

export const providerBadgeRelations = relations(providerBadges, ({ one }) => ({
  provider: one(providerProfiles, {
    fields: [providerBadges.providerId],
    references: [providerProfiles.id]
  }),
  badge: one(badges, {
    fields: [providerBadges.badgeId],
    references: [badges.id]
  }),
}));

export const chefRelations = relations(chefs, ({ one, many }) => ({
  provider: one(providerProfiles, {
    fields: [chefs.providerId],
    references: [providerProfiles.id]
  }),
  menus: many(menus),
}));

export const menuRelations = relations(menus, ({ one }) => ({
  chef: one(chefs, {
    fields: [menus.chefId],
    references: [chefs.id]
  }),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, { 
    fields: [bookings.clientId], 
    references: [users.id],
    relationName: "client_bookings"
  }),
  provider: one(users, { 
    fields: [bookings.providerId], 
    references: [users.id],
    relationName: "provider_bookings" 
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id]
  }),
  reviews: many(reviews),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id]
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id]
  }),
  provider: one(users, {
    fields: [reviews.providerId],
    references: [users.id]
  }),
}));

export const savedProviderRelations = relations(savedProviders, ({ one }) => ({
  client: one(clientProfiles, {
    fields: [savedProviders.clientId],
    references: [clientProfiles.id]
  }),
  provider: one(users, {
    fields: [savedProviders.providerId],
    references: [users.id]
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sent_messages"
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "received_messages"
  }),
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id]
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
}));

export const giftCardRelations = relations(giftCards, ({ one }) => ({
  redeemer: one(users, {
    fields: [giftCards.redeemerId],
    references: [users.id]
  }),
  purchaser: one(users, {
    fields: [giftCards.purchaserId],
    references: [users.id]
  }),
}));

export const referralRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id]
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id]
  }),
}));

export const complaintRelations = relations(complaints, ({ one }) => ({
  client: one(users, {
    fields: [complaints.clientId],
    references: [users.id]
  }),
  provider: one(users, {
    fields: [complaints.providerId],
    references: [users.id]
  }),
  booking: one(bookings, {
    fields: [complaints.bookingId],
    references: [bookings.id]
  }),
}));

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullname: true,
  phone: true,
  role: true,
  profileImage: true,
  bio: true,
  location: true,
});

export const insertClientProfileSchema = createInsertSchema(clientProfiles).pick({
  userId: true,
  preferences: true,
  paymentMethods: true,
});

export const insertProviderProfileSchema = createInsertSchema(providerProfiles).pick({
  userId: true,
  cuisineSpecialty: true,
  yearsExperience: true,
  hourlyRate: true,
  availability: true,
  emergencySupport: true,
  dualExpertise: true,
  availability24_7: true,
  documentLinks: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  providerId: true,
  name: true,
  description: true,
  price: true,
  duration: true,
  isVideoConsultation: true,
  isFaceToFace: true,
});

export const insertChefSchema = createInsertSchema(chefs).omit({
  id: true,
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  paymentStatus: true,
  created_at: true,
  updated_at: true,
}).pick({
  clientId: true,
  providerId: true,
  serviceId: true,
  eventType: true,
  date: true,
  time: true,
  guests: true,
  cuisine: true,
  location: true,
  specialRequests: true,
  totalAmount: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  bookingId: true,
  clientId: true,
  providerId: true,
  rating: true,
  comment: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  bookingId: true,
  content: true,
  attachments: true,
});

export const insertGiftCardSchema = createInsertSchema(giftCards).pick({
  amount: true,
  purchaserId: true,
  expiryDate: true,
  occasion: true,
  message: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type ClientProfile = typeof clientProfiles.$inferSelect;

export type InsertProviderProfile = z.infer<typeof insertProviderProfileSchema>;
export type ProviderProfile = typeof providerProfiles.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertChef = z.infer<typeof insertChefSchema>;
export type Chef = typeof chefs.$inferSelect;

export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menus.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCard = typeof giftCards.$inferSelect;
