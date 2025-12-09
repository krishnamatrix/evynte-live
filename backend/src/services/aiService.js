import OpenAI from 'openai';
import ollama from 'ollama';
import { getSupabase } from '../config/database.js';

// Helper function to check if we should use Ollama
const useOllama = () => process.env.USE_OLLAMA === 'true';

// Initialize OpenAI lazily
const getOpenAI = () => {
  if (useOllama()) return null;
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

// Generate embeddings using OpenAI or Ollama
export const generateEmbedding = async (text) => {
  try {
    console.log('USE_OLLAMA env:', process.env.USE_OLLAMA);
    console.log('useOllama():', useOllama());
    
    if (useOllama()) {
      // Use Ollama for embeddings
      const model = process.env.OLLAMA_EMBEDDING_MODEL || 'mxbai-embed-large';
      console.log(`Generating embedding with Ollama model: ${model}`);
      
      const response = await ollama.embeddings({
        model: model,
        prompt: text
      });

      return response.embedding;
    } else {
      // Use OpenAI for embeddings
      const openai = getOpenAI();
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
    console.log('Generating embedding for search...');
    const supabase = getSupabase();
    const questionEmbedding = await generateEmbedding(question);
    console.log('Embedding generated, length:', questionEmbedding.length);
    
    const threshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.75;
    console.log('Searching with threshold:', threshold);

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

    console.log('Search complete, results:', data?.length || 0);
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

// Generate AI response using OpenAI or Ollama
export const generateAIResponse = async (question, context = '') => {
  try {
    const systemPrompt = `You are a helpful AI assistant for an event Q&A system. 
    Answer questions clearly and concisely based on the context provided. 
    If you're not confident about the answer, say so.
    ${context ? `\n\nContext from previous similar questions:\n${context}` : ''}`;

    if (useOllama()) {
      // Use Ollama for chat completion
      const model = process.env.OLLAMA_MODEL || 'gpt-oss:20b';
      console.log(`Generating response with Ollama model: ${model}`);
      console.log('Calling Ollama chat API...');
      
      const response = await ollama.chat({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
      });
      console.log('Ollama response received:', JSON.stringify(response).substring(0, 200));
      console.log('Response content:', response.message?.content);
      return response.message.content;
    } else {
      // Use OpenAI for chat completion
      const openai = getOpenAI();
      if (!openai) {
        throw new Error('OpenAI client not initialized. Set OPENAI_API_KEY or use USE_OLLAMA=true');
      }

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
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

// Process question and generate response
export const processQuestion = async (question, eventId, questionType) => {
  try {
    console.log('=== Processing Question ===');
    console.log('Question:', question);
    console.log('Event ID:', eventId);
    console.log('Question Type:', questionType);
    
    // Search for similar questions in vector DB
    console.log('Step 1: Searching similar questions...');
    const similarQuestions = await searchSimilarQuestions(question, eventId);
    console.log('Similar questions found:', similarQuestions.length);

    const confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.75;
    
    // Check if we have a high-confidence match
    if (similarQuestions.length > 0 && similarQuestions[0].similarity >= confidenceThreshold) {
      console.log('Step 2: High confidence match found, returning cached answer');
      return {
        answer: similarQuestions[0].answer,
        confidence: similarQuestions[0].similarity,
        source: 'vector_db',
        needsOrganizer: false
      };
    }

    // Build context from similar questions
    console.log('Step 2: Building context from similar questions...');
    let context = '';
    if (similarQuestions.length > 0) {
      context = similarQuestions
        .map(match => `Q: ${match.question}\nA: ${match.answer}`)
        .join('\n\n');
    }
    console.log('Context built, length:', context.length);

    // Generate AI response
    console.log('Step 3: Generating AI response...');
    const aiResponse = await generateAIResponse(question, context);
    console.log('AI Response generated:', aiResponse);
    console.log('Step 4: Preparing final response...');

    // Determine if we need organizer input based on confidence
    // If no similar questions exist, we still provide the AI answer but flag it for organizer review
    const needsOrganizer = false; // Always return AI answer to user
    const lowConfidence = similarQuestions.length === 0 || similarQuestions[0].similarity < confidenceThreshold;

    const finalResult = {
      answer: aiResponse,
      confidence: similarQuestions.length > 0 ? similarQuestions[0].similarity : 0.5,
      source: 'ai_generated',
      needsOrganizer: needsOrganizer,
      lowConfidence: lowConfidence,
      suggestedAnswer: aiResponse
    };
    
    console.log('=== Final Result ===');
    console.log('Answer:', finalResult.answer);
    console.log('Needs Organizer:', finalResult.needsOrganizer);
    console.log('==================');
    
    return finalResult;

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
