import { getSupabase } from '../config/database.js';

export const Event = {
  // Create a new event
  async create(eventData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: eventData.name,
        description: eventData.description,
        organizer_id: eventData.organizerId,
        organizer_name: eventData.organizerName,
        organizer_email: eventData.organizerEmail,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        is_active: eventData.isActive ?? true,
        ai_enabled: eventData.settings?.aiEnabled ?? true,
        allow_personalized_questions: eventData.settings?.allowPersonalizedQuestions ?? true,
        allow_general_questions: eventData.settings?.allowGeneralQuestions ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all events
  async findAll() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get event by ID
  async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Update event
  async update(id, updates) {
    const supabase = getSupabase();
    const updateData = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.settings?.aiEnabled !== undefined) updateData.ai_enabled = updates.settings.aiEnabled;
    if (updates.settings?.allowPersonalizedQuestions !== undefined) {
      updateData.allow_personalized_questions = updates.settings.allowPersonalizedQuestions;
    }
    if (updates.settings?.allowGeneralQuestions !== undefined) {
      updateData.allow_general_questions = updates.settings.allowGeneralQuestions;
    }

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete event
  async delete(id) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export default Event;
