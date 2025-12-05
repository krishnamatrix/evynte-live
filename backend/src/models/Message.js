import { getSupabase } from '../config/database.js';

export const Message = {
  // Create a new message
  async create(messageData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        event_id: messageData.eventId,
        user_id: messageData.userId,
        user_name: messageData.userName,
        user_email: messageData.userEmail,
        question: messageData.question,
        answer: messageData.answer,
        question_type: messageData.questionType || 'general',
        response_source: messageData.responseSource || 'pending',
        ai_confidence: messageData.aiConfidence,
        status: messageData.status || 'pending',
        answered_by: messageData.answeredBy,
        answered_at: messageData.answeredAt,
        saved_to_vector_db: messageData.savedToVectorDB || false,
        vector_db_id: messageData.vectorDBId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find messages by event ID with optional filters
  async findByEvent(eventId, options = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from('messages')
      .select('*')
      .eq('event_id', eventId);

    // Filter by user ID and question type
    if (options.userId) {
      query = query.or(`user_id.eq.${options.userId},question_type.eq.general`);
    }

    // Limit results
    const limit = options.limit || 50;
    query = query.order('created_at', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Find pending/escalated messages for an event
  async findPending(eventId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('event_id', eventId)
      .in('status', ['pending', 'escalated'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Find message by ID
  async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update message
  async update(id, updates) {
    const supabase = getSupabase();
    const updateData = {};

    if (updates.answer !== undefined) updateData.answer = updates.answer;
    if (updates.responseSource) updateData.response_source = updates.responseSource;
    if (updates.aiConfidence !== undefined) updateData.ai_confidence = updates.aiConfidence;
    if (updates.status) updateData.status = updates.status;
    if (updates.answeredBy) updateData.answered_by = updates.answeredBy;
    if (updates.answeredAt) updateData.answered_at = updates.answeredAt;
    if (updates.savedToVectorDB !== undefined) updateData.saved_to_vector_db = updates.savedToVectorDB;
    if (updates.vectorDBId) updateData.vector_db_id = updates.vectorDBId;

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find answered general questions not yet in vector DB
  async findUnsavedAnswers() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .select('*, events(*)')
      .eq('question_type', 'general')
      .eq('status', 'answered')
      .eq('saved_to_vector_db', false)
      .not('answer', 'is', null);

    if (error) throw error;
    return data;
  }
};

export default Message;
