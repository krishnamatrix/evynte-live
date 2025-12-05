import { ollamaService } from './ollamaService.js';
import { evynteAPI } from './evynteAPI.js';
import mcpServer from '../mcp/server.js';

/**
 * AI Conversation Service
 * Orchestrates user messages → Ollama → MCP tools → responses
 */

export const conversationService = {
  /**
   * Process a user message with full AI + tool calling pipeline
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages for context
   * @param {Object} options - Processing options
   * @returns {Object} - Response with content and metadata
   */
  async processMessage(message, conversationHistory = [], options = {}) {
    try {
      // Build conversation context
      const messages = [
        {
          role: 'system',
          content: `You are an AI assistant for the Evynte event management platform. 
You help users with event management, ticket sales, attendee management, invoices, and analytics.
You have access to tools that can query the Evynte API. Use them when needed to provide accurate, real-time information.
Always be helpful, concise, and professional.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      // Get available tools from MCP server
      const toolsResponse = await this.getMCPTools();
      const tools = this.formatToolsForOllama(toolsResponse.tools);

      // Get initial response from Ollama with tool calling
      const response = await ollamaService.chat(messages, tools);

      // If no tool calls, return the response directly
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return {
          content: response.content,
          toolCalls: [],
          sources: [],
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: response.content }
          ]
        };
      }

      // Execute tool calls
      const toolResults = await this.executeTools(response.toolCalls);

      // Add tool results to conversation and get final response
      const messagesWithTools = [
        ...messages,
        {
          role: 'assistant',
          content: response.content,
          tool_calls: response.toolCalls
        },
        ...toolResults.map(result => ({
          role: 'tool',
          content: JSON.stringify(result.result)
        }))
      ];

      // Get final formatted response from Ollama
      const finalResponse = await ollamaService.chat(messagesWithTools, []);

      return {
        content: finalResponse.content,
        toolCalls: response.toolCalls,
        toolResults: toolResults,
        sources: toolResults.map(r => r.tool),
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: finalResponse.content }
        ]
      };
    } catch (error) {
      console.error('Conversation processing error:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  },

  /**
   * Process message with streaming support
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   * @param {Function} onChunk - Callback for streaming chunks
   * @returns {Promise<Object>} - Final response
   */
  async processMessageStream(message, conversationHistory, onChunk) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an AI assistant for the Evynte event management platform.`
        },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const toolsResponse = await this.getMCPTools();
      const tools = this.formatToolsForOllama(toolsResponse.tools);

      let toolCalls = [];
      let fullContent = '';

      // Stream the initial response
      await ollamaService.chatStream(messages, tools, async (chunk) => {
        if (chunk.type === 'content') {
          fullContent = chunk.fullContent;
          onChunk({
            type: 'content',
            content: chunk.content
          });
        } else if (chunk.type === 'tool_calls') {
          toolCalls = chunk.toolCalls;
          onChunk({
            type: 'tool_calls',
            toolCalls
          });
        }
      });

      // If tools were called, execute them and stream final response
      if (toolCalls.length > 0) {
        onChunk({ type: 'executing_tools', count: toolCalls.length });
        
        const toolResults = await this.executeTools(toolCalls);
        
        onChunk({ type: 'tools_complete', results: toolResults });

        // Format final response
        const formattedResponse = await ollamaService.formatToolResults(toolResults, message);
        
        onChunk({ type: 'final_response', content: formattedResponse });

        return {
          content: formattedResponse,
          toolCalls,
          toolResults,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: formattedResponse }
          ]
        };
      }

      return {
        content: fullContent,
        toolCalls: [],
        toolResults: [],
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: fullContent }
        ]
      };
    } catch (error) {
      console.error('Stream processing error:', error);
      throw error;
    }
  },

  /**
   * Get tools from MCP server
   */
  async getMCPTools() {
    try {
      // Call MCP server's tools/list endpoint
      return await mcpServer._requestHandlers['tools/list']();
    } catch (error) {
      console.error('Failed to get MCP tools:', error);
      return { tools: [] };
    }
  },

  /**
   * Format MCP tools for Ollama's tool calling format
   */
  formatToolsForOllama(mcpTools) {
    return mcpTools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
      }
    }));
  },

  /**
   * Execute tool calls from Ollama
   */
  async executeTools(toolCalls) {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const result = await mcpServer._requestHandlers['tools/call']({
          params: {
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments)
          }
        });

        results.push({
          tool: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
          result: result.content[0].text,
          success: !result.isError
        });
      } catch (error) {
        console.error(`Tool execution error (${toolCall.function.name}):`, error);
        results.push({
          tool: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
          result: { error: error.message },
          success: false
        });
      }
    }

    return results;
  },

  /**
   * Extract intent from message
   */
  async extractIntent(message) {
    return await ollamaService.extractIntent(message);
  },

  /**
   * Health check for all services
   */
  async healthCheck() {
    const ollamaHealthy = await ollamaService.healthCheck();
    const evynteHealthy = await evynteAPI.healthCheck();

    return {
      ollama: ollamaHealthy,
      evynte: evynteHealthy,
      overall: ollamaHealthy && evynteHealthy
    };
  }
};

export default conversationService;
