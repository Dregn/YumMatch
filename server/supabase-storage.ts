import { supabase } from './supabase';
import { 
  User, InsertUser,
  ClientProfile, InsertClientProfile,
  ProviderProfile, InsertProviderProfile,
  Chef, InsertChef,
  Menu, InsertMenu,
  Booking, InsertBooking,
  Review, InsertReview,
  Message, InsertMessage,
  GiftCard, InsertGiftCard,
  Service, InsertService
} from '@shared/schema';
import { log } from './vite';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export interface IStorage {
  // Session management
  sessionStore: session.SessionStore;

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
  
  // Chef management
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

export class SupabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformUser(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformUser(data);
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([this.transformUserForInsert(user)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformUser(data);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update(this.transformUserForInsert({
        ...userData,
        updated_at: new Date()
      }))
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformUser(data);
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformUser);
  }

  // Client profiles
  async getClientProfile(userId: number): Promise<ClientProfile | undefined> {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformClientProfile(data);
  }

  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const { data, error } = await supabase
      .from('client_profiles')
      .insert([this.transformClientProfileForInsert(profile)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create client profile: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformClientProfile(data);
  }

  async updateClientProfile(userId: number, profileData: Partial<InsertClientProfile>): Promise<ClientProfile | undefined> {
    // First get the profile ID from user_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !existingProfile) {
      return undefined;
    }
    
    const { data, error } = await supabase
      .from('client_profiles')
      .update({
        ...this.transformClientProfileForInsert(profileData),
        updated_at: new Date()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformClientProfile(data);
  }

  // Provider profiles
  async getProviderProfile(userId: number): Promise<ProviderProfile | undefined> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformProviderProfile(data);
  }

  async createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .insert([this.transformProviderProfileForInsert(profile)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create provider profile: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformProviderProfile(data);
  }

  async updateProviderProfile(userId: number, profileData: Partial<InsertProviderProfile>): Promise<ProviderProfile | undefined> {
    // First get the profile ID from user_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !existingProfile) {
      return undefined;
    }
    
    const { data, error } = await supabase
      .from('provider_profiles')
      .update({
        ...this.transformProviderProfileForInsert(profileData),
        updated_at: new Date()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformProviderProfile(data);
  }

  async getAllProviderProfiles(): Promise<ProviderProfile[]> {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformProviderProfile);
  }

  async getProvidersByFilters(filters: ProviderFilters): Promise<ProviderProfile[]> {
    // This would be a more complex query with multiple filters
    // For now, we'll keep it simple
    let query = supabase
      .from('provider_profiles')
      .select('*');
    
    if (filters.cuisine) {
      query = query.ilike('cuisine_specialty', `%${filters.cuisine}%`);
    }
    
    if (filters.emergencySupport) {
      query = query.eq('emergency_support', true);
    }
    
    if (filters.dualExpertise) {
      query = query.eq('dual_expertise', true);
    }
    
    if (filters.availability24_7) {
      query = query.eq('availability24_7', true);
    }
    
    // Add more filters as needed
    
    const { data, error } = await query;
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformProviderProfile);
  }
  
  // Services
  async getServicesByProvider(providerId: number): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformService);
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformService(data);
  }

  async createService(service: InsertService): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert([this.transformServiceForInsert(service)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create service: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformService(data);
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...this.transformServiceForInsert(serviceData),
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformService(data);
  }

  async deleteService(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  // Chef management
  async getAllChefs(): Promise<Chef[]> {
    const { data, error } = await supabase
      .from('chefs')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformChef);
  }

  async getChefById(id: number): Promise<Chef | undefined> {
    const { data, error } = await supabase
      .from('chefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformChef(data);
  }

  async getChefsByCuisine(cuisine: string): Promise<Chef[]> {
    const { data, error } = await supabase
      .from('chefs')
      .select('*')
      .ilike('cuisine', `%${cuisine}%`);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformChef);
  }

  async createChef(chef: InsertChef): Promise<Chef> {
    const { data, error } = await supabase
      .from('chefs')
      .insert([this.transformChefForInsert(chef)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create chef: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformChef(data);
  }

  // Menu management
  async getAllMenus(): Promise<Menu[]> {
    const { data, error } = await supabase
      .from('menus')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformMenu);
  }

  async getMenuById(id: number): Promise<Menu | undefined> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformMenu(data);
  }

  async getMenusByChef(chefId: number): Promise<Menu[]> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('chef_id', chefId);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformMenu);
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const { data, error } = await supabase
      .from('menus')
      .insert([this.transformMenuForInsert(menu)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create menu: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformMenu(data);
  }

  // Booking management
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert([this.transformBookingForInsert(booking)])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create booking: ${error?.message || 'Unknown error'}`);
    }
    
    return this.transformBooking(data);
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformBooking(data);
  }

  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformBooking);
  }

  async getBookingsByProvider(providerId: number): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('chef_id', providerId);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformBooking);
  }

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(this.transformBooking);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return this.transformBooking(data);
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    // Implementation will depend on your schema
    throw new Error('Not implemented');
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    // Implementation will depend on your schema
    return [];
  }

  async getReviewsByClient(clientId: number): Promise<Review[]> {
    // Implementation will depend on your schema
    return [];
  }

  // Saved providers
  async saveProvider(clientId: number, providerId: number): Promise<boolean> {
    // Implementation will depend on your schema
    return true;
  }

  async unsaveProvider(clientId: number, providerId: number): Promise<boolean> {
    // Implementation will depend on your schema
    return true;
  }

  async getSavedProviders(clientId: number): Promise<User[]> {
    // Implementation will depend on your schema
    return [];
  }

  // Messaging
  async sendMessage(message: InsertMessage): Promise<Message> {
    // Implementation will depend on your schema
    throw new Error('Not implemented');
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    // Implementation will depend on your schema
    return [];
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    // Implementation will depend on your schema
    return 0;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    // Implementation will depend on your schema
    return true;
  }

  // Gift cards
  async createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard> {
    // Implementation will depend on your schema
    throw new Error('Not implemented');
  }

  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    // Implementation will depend on your schema
    return undefined;
  }

  async redeemGiftCard(code: string, userId: number): Promise<boolean> {
    // Implementation will depend on your schema
    return false;
  }

  // Helper methods to transform between Supabase data and our schema types
  private transformUser(data: any): User {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      fullname: data.fullname || null,
      phone: data.phone || null,
      role: data.role,
      profileImage: data.profile_image || null,
      bio: data.bio || null,
      location: data.location || null,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      is_verified: data.is_verified || false
    };
  }

  private transformUserForInsert(data: Partial<InsertUser>): any {
    return {
      username: data.username,
      email: data.email,
      password: data.password,
      fullname: data.fullname || null,
      phone: data.phone || null,
      role: data.role || 'client',
      profile_image: data.profileImage || null,
      bio: data.bio || null,
      location: data.location || null,
      is_verified: data.is_verified || false
    };
  }

  private transformClientProfile(data: any): ClientProfile {
    return {
      id: data.id,
      userId: data.user_id,
      totalSpent: data.total_spent || "0",
      preferences: data.preferences || null,
      favoriteCuisines: data.favorite_cuisines || [],
      dietaryRestrictions: data.dietary_restrictions || [],
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date()
    };
  }

  private transformClientProfileForInsert(data: Partial<InsertClientProfile>): any {
    return {
      user_id: data.userId,
      total_spent: data.totalSpent || "0",
      preferences: data.preferences || null,
      favorite_cuisines: data.favoriteCuisines || [],
      dietary_restrictions: data.dietaryRestrictions || []
    };
  }

  private transformProviderProfile(data: any): ProviderProfile {
    return {
      id: data.id,
      userId: data.user_id,
      cuisineSpecialty: data.cuisine_specialty || null,
      yearsExperience: data.years_experience || null,
      hourlyRate: data.hourly_rate || null,
      availability: data.availability || null,
      emergencySupport: data.emergency_support || false,
      dualExpertise: data.dual_expertise || false,
      availability24_7: data.availability24_7 || false,
      verification_status: data.verification_status || 'pending',
      documents_submitted: data.documents_submitted || false,
      document_links: data.document_links || [],
      commission_rate: data.commission_rate || "26.00",
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date()
    };
  }

  private transformProviderProfileForInsert(data: Partial<InsertProviderProfile>): any {
    return {
      user_id: data.userId,
      cuisine_specialty: data.cuisineSpecialty || null,
      years_experience: data.yearsExperience || null,
      hourly_rate: data.hourlyRate || null,
      availability: data.availability || null,
      emergency_support: data.emergencySupport || false,
      dual_expertise: data.dualExpertise || false,
      availability24_7: data.availability24_7 || false,
      verification_status: 'pending',
      documents_submitted: data.documents_submitted || false,
      document_links: data.document_links || [],
      commission_rate: data.commission_rate || "26.00"
    };
  }

  private transformService(data: any): Service {
    // Implementation will depend on your schema
    return {
      id: data.id,
      providerId: data.provider_id,
      name: data.name,
      description: data.description || null,
      price: data.price || null,
      duration: data.duration || null,
      category: data.category || null,
      tags: data.tags || []
    };
  }

  private transformServiceForInsert(data: Partial<InsertService>): any {
    // Implementation will depend on your schema
    return {
      provider_id: data.providerId,
      name: data.name,
      description: data.description || null,
      price: data.price || null,
      duration: data.duration || null,
      category: data.category || null,
      tags: data.tags || []
    };
  }

  private transformChef(data: any): Chef {
    return {
      id: data.id,
      name: data.name,
      profileImage: data.profile_image || null,
      cuisine: data.cuisine || null,
      price: data.price || 0,
      description: data.description || null,
      rating: data.rating || "0",
      reviewCount: data.review_count || 0
    };
  }

  private transformChefForInsert(data: Partial<InsertChef>): any {
    return {
      name: data.name,
      profile_image: data.profileImage || null,
      cuisine: data.cuisine || null,
      price: data.price || 0,
      description: data.description || null,
      rating: data.rating || "0",
      review_count: data.reviewCount || 0
    };
  }

  private transformMenu(data: any): Menu {
    return {
      id: data.id,
      chefId: data.chef_id || null,
      name: data.name,
      image: data.image || null,
      description: data.description || null,
      courses: data.courses || null,
      guestRange: data.guest_range || null,
      price: data.price || 0,
      items: data.items || []
    };
  }

  private transformMenuForInsert(data: Partial<InsertMenu>): any {
    return {
      chef_id: data.chefId || null,
      name: data.name,
      image: data.image || null,
      description: data.description || null,
      courses: data.courses || null,
      guest_range: data.guestRange || null,
      price: data.price || 0,
      items: data.items || []
    };
  }

  private transformBooking(data: any): Booking {
    return {
      id: data.id,
      userId: data.user_id,
      chefId: data.chef_id,
      menuId: data.menu_id,
      date: data.date ? new Date(data.date) : null,
      guests: data.guests || 0,
      address: data.address || null,
      status: data.status || 'pending',
      specialRequests: data.special_requests || null,
      totalPrice: data.total_price || null,
      isPaid: data.is_paid || false,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date()
    };
  }

  private transformBookingForInsert(data: Partial<InsertBooking>): any {
    return {
      user_id: data.userId,
      chef_id: data.chefId,
      menu_id: data.menuId,
      date: data.date,
      guests: data.guests || 0,
      address: data.address || null,
      status: data.status || 'pending',
      special_requests: data.specialRequests || null,
      total_price: data.totalPrice || null,
      is_paid: data.isPaid || false
    };
  }
}

export const supabaseStorage = new SupabaseStorage();