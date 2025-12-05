import ollama from 'ollama';

/**
 * Ollama LLM Service
 * Handles interactions with local or remote Ollama instance
 */


const MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export const ollamaService = {
  /**
   * Generate a chat completion with tool calling support
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Array} tools - Array of available tools from MCP server
   * @param {Object} options - Additional options for generation
   * @returns {Object} - Response with content and tool calls
   */
  async chat(messages, tools = [], options = {}) {
    try {
      const response = await ollama.chat({
        model: MODEL,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          ...options
        }
      });

      return {
        content: response.message.content,
        toolCalls: response.message.tool_calls || [],
        role: response.message.role,
        done: response.done
      };
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  },

  /**
   * Generate a streaming chat completion
   * @param {Array} messages - Array of message objects
   * @param {Array} tools - Array of available tools
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise} - Resolves when stream completes
   */
  async chatStream(messages, tools = [], onChunk) {
    try {
      const stream = await ollama.chat({
        model: MODEL,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        stream: true
      });

      let fullContent = '';
      let toolCalls = [];

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          fullContent += chunk.message.content;
          onChunk({
            type: 'content',
            content: chunk.message.content,
            fullContent
          });
        }

        if (chunk.message?.tool_calls) {
          toolCalls = chunk.message.tool_calls;
          onChunk({
            type: 'tool_calls',
            toolCalls
          });
        }

        if (chunk.done) {
          onChunk({
            type: 'done',
            fullContent,
            toolCalls
          });
        }
      }

      return { fullContent, toolCalls };
    } catch (error) {
      console.error('Ollama stream error:', error);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  },

  /**
   * Extract intent and entities from user message
   * @param {string} message - User message
   * @returns {Object} - Extracted intent and entities
   */
  async extractIntent(message) {
    try {
      const systemPrompt = `You are an intent extraction assistant. Analyze the user's message and extract:
1. Primary intent (e.g., list_events, get_invoice, resend_invoice, etc.)
2. Entities mentioned (event names, invoice IDs, dates, etc.)
3. Additional context or filters

Respond in JSON format:
{
  "intent": "primary_intent",
  "entities": {"entity_type": "value"},
  "confidence": 0.0-1.0,
  "requires_tool": true/false,
  "suggested_tool": "tool_name"
}`;

      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        format: 'json',
        stream: false
      });

      return JSON.parse(response.message.content);
    } catch (error) {
      console.error('Intent extraction error:', error);
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0,
        requires_tool: false
      };
    }
  },

  /**
   * Format tool results into a natural language response
   * @param {Array} toolResults - Results from tool executions
   * @param {string} originalQuery - Original user query
   * @returns {string} - Formatted response
   */
  async formatToolResults(toolResults, originalQuery) {
    try {
      const systemPrompt = `You are a helpful assistant for the Evynte event platform. 
Format the tool results into a clear, natural language response that answers the user's query.
Be concise but informative. Include relevant details like dates, names, amounts, etc.
If multiple items are returned, format them as a clear list or table.`;

      const toolResultsText = toolResults.map(result => 
        `Tool: ${result.tool}\nResult: ${JSON.stringify(result.result, null, 2)}`
      ).join('\n\n');

      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User query: ${originalQuery}\n\nTool results:\n${toolResultsText}\n\nProvide a natural language response:` }
        ],
        stream: false
      });

      return response.message.content;
    } catch (error) {
      console.error('Format results error:', error);
      return 'I retrieved the information, but had trouble formatting it. Here are the raw results: ' + 
             JSON.stringify(toolResults, null, 2);
    }
  },

  /**
   * Check if Ollama is available
   * @returns {boolean} - True if Ollama is running
   */
  async healthCheck() {
    try {
      const models = await ollama.list();
      return models && models.models.length > 0;
    } catch (error) {
      console.error('Ollama health check failed:', error.message);
      return false;
    }
  },

  /**
   * List available models
   * @returns {Array} - List of model names
   */
  async listModels() {
    try {
      const response = await ollama.list();
      return response.models.map(m => m.name);
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  },

  /**
   * Pull a model if not already available
   * @param {string} modelName - Name of the model to pull
   * @returns {boolean} - Success status
   */
  async ensureModel(modelName = MODEL) {
    try {
      const models = await this.listModels();
      if (models.includes(modelName)) {
        return true;
      }

      console.log(`Pulling model ${modelName}...`);
      await ollama.pull({ model: modelName });
      console.log(`Model ${modelName} pulled successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }
};

export default ollamaService;
