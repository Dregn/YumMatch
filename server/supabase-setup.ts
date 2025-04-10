import { supabase } from './supabase';
import { log } from './vite';

// SQL scripts to create tables and functions
const SQL_SCRIPTS = {
  // Create tables if they don't exist
  createUsersTables: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
      profile_image TEXT,
      bio TEXT,
      location TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_verified BOOLEAN DEFAULT FALSE
    );
  `,
  
  createClientProfilesTable: `
    CREATE TABLE IF NOT EXISTS client_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      total_spent TEXT DEFAULT '0',
      preferences JSONB,
      favorite_cuisines TEXT[],
      dietary_restrictions TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  createProviderProfilesTable: `
    CREATE TABLE IF NOT EXISTS provider_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      cuisine_specialty TEXT,
      years_experience INTEGER,
      hourly_rate TEXT,
      availability TEXT,
      emergency_support BOOLEAN DEFAULT FALSE,
      dual_expertise BOOLEAN DEFAULT FALSE,
      availability24_7 BOOLEAN DEFAULT FALSE,
      verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')),
      documents_submitted BOOLEAN DEFAULT FALSE,
      document_links TEXT[],
      commission_rate TEXT DEFAULT '26.00',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  createChefsTable: `
    CREATE TABLE IF NOT EXISTS chefs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      profile_image TEXT,
      cuisine TEXT,
      price INTEGER,
      description TEXT,
      rating TEXT,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  createMenusTable: `
    CREATE TABLE IF NOT EXISTS menus (
      id SERIAL PRIMARY KEY,
      chef_id INTEGER REFERENCES chefs(id),
      name TEXT NOT NULL,
      image TEXT,
      description TEXT,
      courses TEXT,
      guest_range TEXT,
      price INTEGER,
      items TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  createBookingsTable: `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      chef_id INTEGER REFERENCES chefs(id),
      menu_id INTEGER REFERENCES menus(id),
      date TIMESTAMP WITH TIME ZONE,
      guests INTEGER,
      address TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      special_requests TEXT,
      total_price TEXT,
      is_paid BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  // Create stored procedures
  createStoredProcedures: `
    -- Create users table if not exists
    CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
        profile_image TEXT,
        bio TEXT,
        location TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Create client_profiles table if not exists
    CREATE OR REPLACE FUNCTION create_client_profiles_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS client_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_spent TEXT DEFAULT '0',
        preferences JSONB,
        favorite_cuisines TEXT[],
        dietary_restrictions TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Create provider_profiles table if not exists
    CREATE OR REPLACE FUNCTION create_provider_profiles_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS provider_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        cuisine_specialty TEXT,
        years_experience INTEGER,
        hourly_rate TEXT,
        availability TEXT,
        emergency_support BOOLEAN DEFAULT FALSE,
        dual_expertise BOOLEAN DEFAULT FALSE,
        availability24_7 BOOLEAN DEFAULT FALSE,
        verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')),
        documents_submitted BOOLEAN DEFAULT FALSE,
        document_links TEXT[],
        commission_rate TEXT DEFAULT '26.00',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Create chefs table if not exists
    CREATE OR REPLACE FUNCTION create_chefs_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS chefs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        profile_image TEXT,
        cuisine TEXT,
        price INTEGER,
        description TEXT,
        rating TEXT,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Create menus table if not exists
    CREATE OR REPLACE FUNCTION create_menus_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        chef_id INTEGER REFERENCES chefs(id),
        name TEXT NOT NULL,
        image TEXT,
        description TEXT,
        courses TEXT,
        guest_range TEXT,
        price INTEGER,
        items TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Create bookings table if not exists
    CREATE OR REPLACE FUNCTION create_bookings_table_if_not_exists()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        chef_id INTEGER REFERENCES chefs(id),
        menu_id INTEGER REFERENCES menus(id),
        date TIMESTAMP WITH TIME ZONE,
        guests INTEGER,
        address TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        special_requests TEXT,
        total_price TEXT,
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    END;
    $$ LANGUAGE plpgsql;
  `,
  
  // Insert sample chefs data
  insertSampleChefs: `
    INSERT INTO chefs (name, profile_image, cuisine, price, description, rating, review_count)
    VALUES 
      ('Chef Marco', 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80', 'Italian', 120, 'Passionate Italian chef with 10+ years of experience in top restaurants across Europe.', '4.8', 24),
      ('Chef Sophia', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80', 'French', 150, 'Classically trained French chef specializing in fine dining experiences.', '4.9', 36),
      ('Chef Ling', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1677&q=80', 'Asian Fusion', 130, 'Expert in Asian fusion cuisine with creative flair and attention to detail.', '4.7', 18),
      ('Chef Miguel', 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80', 'Spanish', 110, 'Specializes in authentic Spanish tapas and paella from various regions of Spain.', '4.6', 15),
      ('Chef Aisha', 'https://images.unsplash.com/photo-1607631568211-71f4bce4beeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'Middle Eastern', 125, 'Creating authentic Middle Eastern cuisine with a modern twist.', '4.8', 22),
      ('Chef James', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'American BBQ', 100, 'BBQ expert with a passion for slow-cooked meats and homestyle sides.', '4.7', 31),
      ('Chef Olivia', 'https://images.unsplash.com/photo-1595257841889-eca2678454e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80', 'Vegetarian', 115, 'Plant-based cuisine expert creating flavorful, creative vegetarian and vegan dishes.', '4.9', 27),
      ('Chef Ravi', 'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1529&q=80', 'Indian', 140, 'Brings the rich flavors and spices of authentic Indian cuisine to your home.', '4.8', 19),
      ('Chef Pierre', 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80', 'Patisserie', 160, 'Master pastry chef creating exquisite desserts and sweet delicacies.', '4.9', 41),
      ('Chef Elena', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80', 'Mediterranean', 135, 'Specializes in fresh Mediterranean cuisine highlighting seafood and seasonal ingredients.', '4.8', 33)
    ON CONFLICT (id) DO NOTHING;
  `,
  
  // Insert sample menus data
  insertSampleMenus: `
    INSERT INTO menus (chef_id, name, image, description, courses, guest_range, price, items)
    VALUES 
      (1, 'Italian Feast', 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'A traditional Italian multi-course dinner featuring classic dishes from various regions.', '4 courses', '4-8 guests', 150, ARRAY['Antipasti Platter', 'Handmade Pasta', 'Osso Buco', 'Tiramisu']),
      (1, 'Coastal Italian', 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1380&q=80', 'Fresh seafood dishes inspired by the Italian coastline.', '3 courses', '2-6 guests', 130, ARRAY['Seafood Risotto', 'Grilled Branzino', 'Lemon Panna Cotta']),
      (2, 'French Classics', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'A refined French dining experience featuring traditional techniques and premium ingredients.', '5 courses', '4-10 guests', 180, ARRAY['French Onion Soup', 'Duck Confit', 'Beef Bourguignon', 'Cheese Selection', 'Crème Brûlée']),
      (3, 'Asian Fusion Experience', 'https://images.unsplash.com/photo-1540648639573-8c848de23f0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1724&q=80', 'Creative dishes blending techniques and flavors from across Asia.', '4 courses', '4-8 guests', 140, ARRAY['Dim Sum Selection', 'Korean BBQ Tacos', 'Thai Curry with Jasmine Rice', 'Matcha Cheesecake']),
      (4, 'Spanish Tapas Night', 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'An authentic Spanish tapas experience with traditional small plates and paella.', 'Multiple tapas + main', '6-12 guests', 120, ARRAY['Patatas Bravas', 'Gambas al Ajillo', 'Jamón and Cheese Selection', 'Seafood Paella', 'Churros con Chocolate']),
      (5, 'Middle Eastern Feast', 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80', 'Vibrant dishes celebrating the diverse flavors of Middle Eastern cuisine.', '4 courses', '6-10 guests', 135, ARRAY['Mezze Platter', 'Lamb Kofta', 'Chicken Shawarma', 'Baklava Assortment']),
      (6, 'American BBQ Cookout', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1965&q=80', 'Classic American BBQ featuring slow-smoked meats and traditional sides.', '3 courses + sides', '8-20 guests', 110, ARRAY['Smoked Brisket', 'BBQ Ribs', 'Pulled Pork', 'Mac and Cheese', 'Cornbread', 'Coleslaw']),
      (7, 'Plant-Based Gourmet', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', 'Creative vegetarian and vegan dishes that will impress even non-vegetarians.', '4 courses', '2-8 guests', 125, ARRAY['Roasted Vegetable Tart', 'Mushroom Wellington', 'Plant-Based Risotto', 'Vegan Chocolate Mousse']),
      (8, 'Indian Spice Journey', 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80', 'An aromatic exploration of diverse Indian cuisines from across the subcontinent.', '4 courses', '4-12 guests', 150, ARRAY['Samosa Chaat', 'Butter Chicken', 'Lamb Biryani', 'Garlic Naan', 'Gulab Jamun']),
      (9, 'Dessert Extravaganza', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80', 'A show-stopping dessert experience featuring French patisserie classics.', '5 dessert courses', '4-10 guests', 170, ARRAY['Petit Fours', 'Paris-Brest', 'Chocolate Soufflé', 'Macarons Selection', 'Opera Cake']),
      (10, 'Mediterranean Summer', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80', 'Fresh, light dishes inspired by Mediterranean coastal cuisine.', '4 courses', '4-8 guests', 145, ARRAY['Greek Meze Platter', 'Grilled Octopus', 'Mediterranean Sea Bass', 'Orange Blossom Panna Cotta'])
    ON CONFLICT (id) DO NOTHING;
  `
};

// Execute SQL scripts
export async function setupSupabaseTables() {
  try {
    log('Setting up Supabase tables...', 'info');
    
    // First, create tables
    for (const key of [
      'createUsersTables',
      'createClientProfilesTable',
      'createProviderProfilesTable',
      'createChefsTable',
      'createMenusTable',
      'createBookingsTable'
    ]) {
      log(`⏳ Creating ${key}...`, 'info');
      const { error } = await supabase.rpc('exec_sql', { sql: SQL_SCRIPTS[key] });
      if (error) {
        log(`❌ Error creating ${key}: ${error.message}`, 'error');
      } else {
        log(`✅ Successfully created ${key}`, 'info');
      }
    }
    
    if (createTablesError) {
      log(`Error creating tables: ${createTablesError.message}`, 'error');
      
      // Try individual creation
      log('Trying individual table creation...', 'info');
      for (const key of ['createUsersTables', 'createClientProfilesTable', 'createProviderProfilesTable', 
                         'createChefsTable', 'createMenusTable', 'createBookingsTable']) {
        const { error } = await supabase.rpc('exec_sql', { sql: SQL_SCRIPTS[key] });
        if (error) {
          log(`Error creating ${key}: ${error.message}`, 'error');
        } else {
          log(`Successfully created ${key}`, 'info');
        }
      }
    }
    
    // Create stored procedures
    const { error: proceduresError } = await supabase.rpc('exec_sql', { sql: SQL_SCRIPTS.createStoredProcedures });
    if (proceduresError) {
      log(`Error creating stored procedures: ${proceduresError.message}`, 'error');
    } else {
      log('Successfully created stored procedures', 'info');
    }
    
    // Check if chefs table is empty before inserting sample data
    const { data: chefsCount, error: countError } = await supabase
      .from('chefs')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      log(`Error checking chefs count: ${countError.message}`, 'error');
    } else if (chefsCount && chefsCount.length === 0) {
      // Insert sample data
      const { error: chefsError } = await supabase.rpc('exec_sql', { sql: SQL_SCRIPTS.insertSampleChefs });
      if (chefsError) {
        log(`Error inserting sample chefs: ${chefsError.message}`, 'error');
      } else {
        log('Successfully inserted sample chefs', 'info');
      }
      
      const { error: menusError } = await supabase.rpc('exec_sql', { sql: SQL_SCRIPTS.insertSampleMenus });
      if (menusError) {
        log(`Error inserting sample menus: ${menusError.message}`, 'error');
      } else {
        log('Successfully inserted sample menus', 'info');
      }
    }
    
    log('Supabase tables setup completed', 'info');
    return true;
  } catch (error) {
    log(`Error setting up Supabase tables: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
}

// Use direct SQL instead of RPC function
export async function setupSupabaseFunction() {
  try {
    log('Setting up direct database access...', 'info');
    return true;
  } catch (error) {
    log(`Error setting up direct database access: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
}

// Setup database tables directly with postgres client
export async function setupDatabaseDirectly() {
  try {
    log('Creating database tables directly...', 'info');
    
    // Import db client
    const { db } = await import('./db');
    
    // Create tables in order
    try {
      await db.execute(SQL_SCRIPTS.createUsersTables);
      log('Users table created successfully', 'info');
    } catch (error) {
      log(`Error creating users table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.createClientProfilesTable);
      log('Client profiles table created successfully', 'info');
    } catch (error) {
      log(`Error creating client profiles table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.createProviderProfilesTable);
      log('Provider profiles table created successfully', 'info');
    } catch (error) {
      log(`Error creating provider profiles table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.createChefsTable);
      log('Chefs table created successfully', 'info');
    } catch (error) {
      log(`Error creating chefs table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.createMenusTable);
      log('Menus table created successfully', 'info');
    } catch (error) {
      log(`Error creating menus table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.createBookingsTable);
      log('Bookings table created successfully', 'info');
    } catch (error) {
      log(`Error creating bookings table: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    // Insert sample data
    try {
      await db.execute(SQL_SCRIPTS.insertSampleChefs);
      log('Sample chefs inserted successfully', 'info');
    } catch (error) {
      log(`Error inserting sample chefs: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    try {
      await db.execute(SQL_SCRIPTS.insertSampleMenus);
      log('Sample menus inserted successfully', 'info');
    } catch (error) {
      log(`Error inserting sample menus: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    return true;
  } catch (error) {
    log(`Error setting up database directly: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  } 
    
}