import OpenAI from 'openai';
import ollama from 'ollama';
import { getSupabase } from '../config/database.js';

const USE_OLLAMA = process.env.USE_OLLAMA === 'true';

// Initialize OpenAI (only if not using Ollama)
const openai = !USE_OLLAMA && process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Generate embeddings using OpenAI or Ollama
export const generateEmbedding = async (text) => {
  try {
    if (USE_OLLAMA) {
      // Use Ollama for embeddings
      const model = process.env.OLLAMA_EMBEDDING_MODEL || process.env.OLLAMA_MODEL || 'gemma3:270m';
      console.log(`Generating embedding with Ollama model: ${model}`);
      
      const response = await ollama.embeddings({
        model: model,
        prompt: text
      });

      return response.embedding;
    } else {
      // Use OpenAI for embeddings
      if (!openai) {
        throw new Error('OpenAI client not initialized. Set OPENAI_API_KEY or use USE_OLLAMA=true');
      }
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    }
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

// Search for similar questions using pgvector
export const searchSimilarQuestions = async (question, eventId, topK = 3) => {
  try {
    const supabase = getSupabase();
    const questionEmbedding = await generateEmbedding(question);
    
    const threshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.75;

    // Use the RPC function for vector similarity search
    const { data, error } = await supabase.rpc('search_similar_questions', {
      query_embedding: questionEmbedding,
      event_uuid: eventId,
      match_threshold: threshold,
      match_count: topK
    });

    if (error) {
      console.error('Error searching similar questions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching similar questions:', error);
    return [];
  }
};

// Store Q&A pair in pgvector (only for general questions)
export const storeQAPair = async (question, answer, eventId, messageId) => {
  try {
    const supabase = getSupabase();
    const embedding = await generateEmbedding(question);

    const { data, error } = await supabase
      .from('qa_embeddings')
      .insert({
        event_id: eventId,
        message_id: messageId,
        question,
        answer,
        embedding
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error storing Q&A pair:', error);
    throw error;
  }
};

// Generate AI response using OpenAI
export const generateAIResponse = async (question, context = '') => {
  try {
    const systemPrompt = `You are a helpful AI assistant for an event Q&A system. 
    Answer questions clearly and concisely based on the context provided. 
    If you're not confident about the answer, say so.
    ${context ? `\n\nContext from previous similar questions:\n${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

// Process question and generate response
export const processQuestion = async (question, eventId, questionType) => {
  try {
    // Search for similar questions in vector DB
    const similarQuestions = await searchSimilarQuestions(question, eventId);

    const confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.75;
    
    // Check if we have a high-confidence match
    if (similarQuestions.length > 0 && similarQuestions[0].similarity >= confidenceThreshold) {
      return {
        answer: similarQuestions[0].answer,
        confidence: similarQuestions[0].similarity,
        source: 'vector_db',
        needsOrganizer: false
      };
    }

    // Build context from similar questions
    let context = '';
    if (similarQuestions.length > 0) {
      context = similarQuestions
        .map(match => `Q: ${match.question}\nA: ${match.answer}`)
        .join('\n\n');
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(question, context);

    // Determine if we need organizer input based on confidence
    const needsOrganizer = similarQuestions.length === 0 || similarQuestions[0].similarity < confidenceThreshold;

    return {
      answer: aiResponse,
      confidence: similarQuestions.length > 0 ? similarQuestions[0].similarity : 0,
      source: 'ai_generated',
      needsOrganizer,
      suggestedAnswer: !needsOrganizer ? aiResponse : null
    };

  } catch (error) {
    console.error('Error processing question:', error);
    return {
      answer: null,
      confidence: 0,
      source: 'error',
      needsOrganizer: true,
      error: error.message
    };
  }
};

export default {
  generateEmbedding,
  searchSimilarQuestions,
  storeQAPair,
  generateAIResponse,
  processQuestion
};
