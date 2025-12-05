import { createClient } from '@supabase/supabase-js';

let supabase = null;

export const connectDB = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test connection
    const { error } = await supabase.from('events').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      throw error;
    }

    console.log('Supabase Connected Successfully');
    return supabase;
  } catch (error) {
    console.error(`Error connecting to Supabase: ${error.message}`);
    process.exit(1);
  }
};

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call connectDB first.');
  }
  return supabase;
};

export default { connectDB, getSupabase };
