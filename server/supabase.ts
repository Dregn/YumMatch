import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Required environment variables
const supabaseUrl = "https://eriaopklhrdeldvnassa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaWFvcGtsaHJkZWxkdm5hc3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODA4NTgsImV4cCI6MjA1OTg1Njg1OH0.fL0jUJ9oaeB3i-PohFIdrrHIfQ0P91JWS0f8Tz2KSwg";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

log(`Using Supabase URL: ${supabaseUrl}`, 'info');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Test connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      log(`Supabase connection test failed: ${error.message}`, 'error');
      return false;
    }
    log('Supabase connection test successful', 'info');
    return true;
  } catch (error) {
    log(`Supabase connection error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
}

// Helper to initialize database tables if they don't exist
export async function initializeSupabaseTables() {
  try {
    log('Checking Supabase tables...', 'info');
    
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
    if (usersError) {
      log(`Error creating users table: ${usersError.message}`, 'error');
    }
    
    // Create client_profiles table if it doesn't exist
    const { error: clientProfilesError } = await supabase.rpc('create_client_profiles_table_if_not_exists');
    if (clientProfilesError) {
      log(`Error creating client_profiles table: ${clientProfilesError.message}`, 'error');
    }
    
    // Create provider_profiles table if it doesn't exist
    const { error: providerProfilesError } = await supabase.rpc('create_provider_profiles_table_if_not_exists');
    if (providerProfilesError) {
      log(`Error creating provider_profiles table: ${providerProfilesError.message}`, 'error');
    }
    
    // Create chefs table if it doesn't exist
    const { error: chefsError } = await supabase.rpc('create_chefs_table_if_not_exists');
    if (chefsError) {
      log(`Error creating chefs table: ${chefsError.message}`, 'error');
    }
    
    // Create menus table if it doesn't exist
    const { error: menusError } = await supabase.rpc('create_menus_table_if_not_exists');
    if (menusError) {
      log(`Error creating menus table: ${menusError.message}`, 'error');
    }
    
    // Create bookings table if it doesn't exist
    const { error: bookingsError } = await supabase.rpc('create_bookings_table_if_not_exists');
    if (bookingsError) {
      log(`Error creating bookings table: ${bookingsError.message}`, 'error');
    }
    
    log('Supabase tables setup completed', 'info');
    return true;
  } catch (error) {
    log(`Error initializing Supabase tables: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
}