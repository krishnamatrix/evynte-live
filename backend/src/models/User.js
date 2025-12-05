import { getSupabase } from '../config/database.js';

export const User = {
  // Create a new user
  async create(userData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'attendee'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find user by userId
  async findByUserId(userId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  // Find or create user
  async findOrCreate(userData) {
    const existing = await this.findByUserId(userData.userId);
    if (existing) return existing;
    return await this.create(userData);
  },

  // Add user to event
  async addToEvent(userId, eventId) {
    const supabase = getSupabase();
    
    // Get user's internal ID
    const user = await this.findByUserId(userId);
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('user_events')
      .insert({
        user_id: user.id,
        event_id: eventId
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // 23505 = unique violation (already exists)
    return data;
  }
};

export default User;
