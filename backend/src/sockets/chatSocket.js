import { Message } from '../models/Message.js';
import { Event } from '../models/Event.js';
import { processQuestion, storeQAPair } from '../services/aiService.js';
import { conversationService } from '../services/conversationService.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join event room
    socket.on('join-event', async (data) => {
      const { eventId, userId, userName } = data;
      console.log(eventId, userId, userName);
      socket.join(`event-${eventId}`);
      socket.join(`user-${userId}`);

      console.log(`User ${userName} joined event ${eventId}`);

      // Notify organizers
      socket.to(`event-${eventId}`).emit('user-joined', {
        userId,
        userName,
        timestamp: new Date()
      });
    });

    // Handle new question
    socket.on('send-question', async (data) => {
      try {
        const { eventId, userId, userName, userEmail, question, questionType } = data;
        console.log(eventId, userId, userName, userEmail, question, questionType);
        // Validate event exists and is active
        const event = await Event.findById(eventId);
        if (!event || event.event_status !== 'PUBLISHED') {
          socket.emit('error', { message: 'Event not found or inactive' });
          return;
        }

        // Create message record
        const message = await Message.create({
          eventId,
          userId,
          userName,
          userEmail,
          question,
          questionType,
          status: 'pending'
        });
        console.log(message);

        // Emit typing indicator
        io.to(`event-${eventId}`).emit('typing', {
          userId,
          userName,
          isTyping: false
        });

        // Emit AI is processing
        socket.emit('ai-processing', { messageId: message.id });

        // Process with AI
        const aiResult = await processQuestion(question, eventId, questionType);

        if (aiResult.answer && !aiResult.needsOrganizer) {
          // AI provided a confident answer
          const updatedMessage = await Message.update(message.id, {
            answer: aiResult.answer,
            responseSource: 'ai',
            aiConfidence: aiResult.confidence,
            status: 'answered',
            answeredAt: new Date().toISOString()
          });

          // Store to vector DB if it's a general question AND it's a new AI-generated answer
          if (questionType === 'general' && aiResult.source === 'ai_generated') {
            const vectorId = await storeQAPair(
              question,
              aiResult.answer,
              eventId,
              message.id
            );
            await Message.update(message.id, {
              savedToVectorDB: true,
              vectorDBId: vectorId
            });
          }

          // Emit answer to user
          if (questionType === 'personalized') {
            // Send only to the specific user
            io.to(`user-${userId}`).emit('receive-answer', updatedMessage);
          } else {
            // Send to everyone in the event
            io.to(`event-${eventId}`).emit('receive-answer', updatedMessage);
          }
        } else {
          // Escalate to organizer
          const updatedMessage = await Message.update(message.id, {
            status: 'escalated',
            aiConfidence: aiResult.confidence
          });

          // Notify organizers
          io.to(`event-${eventId}`).emit('question-escalated', {
            message: updatedMessage,
            suggestedAnswer: aiResult.suggestedAnswer
          });

          // Notify user
          socket.emit('question-escalated', {
            messageId: message.id,
            message: 'Your question has been forwarded to the organizer.'
          });
        }

      } catch (error) {
        console.error('Error processing question:', error);
        socket.emit('error', { message: 'Failed to process question' });
      }
    });

    // Handle organizer response
    socket.on('organizer-answer', async (data) => {
      try {
        const { messageId, answer, answeredBy, saveToVectorDB } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        const updatedMessage = await Message.update(messageId, {
          answer,
          answeredBy,
          answeredAt: new Date().toISOString(),
          status: 'answered',
          responseSource: 'organizer'
        });

        // Store to vector DB if requested and it's a general question
        if (saveToVectorDB && message.question_type === 'general') {
          const vectorId = await storeQAPair(
            message.question,
            answer,
            message.event_id,
            messageId
          );
          await Message.update(messageId, {
            savedToVectorDB: true,
            vectorDBId: vectorId
          });
        }

        // Send answer to appropriate audience
        if (message.question_type === 'personalized') {
          io.to(`user-${message.user_id}`).emit('receive-answer', updatedMessage);
        } else {
          io.to(`event-${message.event_id}`).emit('receive-answer', updatedMessage);
        }

        // Notify organizer dashboard
        socket.emit('answer-sent', { messageId, success: true });

      } catch (error) {
        console.error('Error sending organizer answer:', error);
        socket.emit('error', { message: 'Failed to send answer' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { eventId, userId, userName, isTyping } = data;
      socket.to(`event-${eventId}`).emit('typing', { userId, userName, isTyping });
    });

    // ========== NEW: AI CONVERSATIONAL CHAT HANDLERS ==========

    // Handle AI chat message with Ollama + MCP tools
    socket.on('ai-chat', async (data) => {
      try {
        const { eventId, userId, userName, message, conversationHistory = [] } = data;

        console.log(`AI Chat from ${userName}: ${message}`);

        // Emit processing status
        socket.emit('ai-chat-status', {
          status: 'processing',
          message: 'Thinking...'
        });

        // Process with streaming
        let fullResponse = '';
        let toolExecutions = [];

        await conversationService.processMessageStream(
          message,
          conversationHistory,
          (chunk) => {
            if (chunk.type === 'content') {
              fullResponse += chunk.content;
              socket.emit('ai-chat-stream', {
                type: 'content',
                content: chunk.content
              });
            } else if (chunk.type === 'tool_calls') {
              socket.emit('ai-chat-status', {
                status: 'executing_tools',
                message: `Executing ${chunk.toolCalls.length} tool(s)...`,
                tools: chunk.toolCalls.map(tc => tc.function.name)
              });
            } else if (chunk.type === 'executing_tools') {
              socket.emit('ai-chat-status', {
                status: 'executing_tools',
                message: `Calling Evynte APIs...`,
                count: chunk.count
              });
            } else if (chunk.type === 'tools_complete') {
              toolExecutions = chunk.results;
              socket.emit('ai-chat-tools', {
                results: chunk.results.map(r => ({
                  tool: r.tool,
                  success: r.success,
                  summary: r.success ? 'Success' : 'Failed'
                }))
              });
            } else if (chunk.type === 'final_response') {
              socket.emit('ai-chat-stream', {
                type: 'final_content',
                content: chunk.content
              });
            }
          }
        );

        // Emit completion
        socket.emit('ai-chat-complete', {
          fullResponse,
          toolExecutions: toolExecutions.map(te => ({
            tool: te.tool,
            success: te.success
          }))
        });

      } catch (error) {
        console.error('AI chat error:', error);
        socket.emit('ai-chat-error', {
          message: 'Failed to process your message. Please try again.',
          error: error.message
        });
      }
    });

    // Handle AI chat without streaming (faster for simple queries)
    socket.on('ai-chat-simple', async (data) => {
      try {
        const { eventId, userId, userName, message, conversationHistory = [] } = data;

        socket.emit('ai-chat-status', { status: 'processing' });

        const response = await conversationService.processMessage(
          message,
          conversationHistory
        );

        socket.emit('ai-chat-response', {
          content: response.content,
          toolCalls: response.toolCalls.map(tc => tc.function?.name || 'unknown'),
          sources: response.sources
        });

      } catch (error) {
        console.error('AI chat simple error:', error);
        socket.emit('ai-chat-error', {
          message: 'Failed to process your message.',
          error: error.message
        });
      }
    });

    // Get AI conversation suggestions
    socket.on('ai-suggestions', async (data) => {
      try {
        const { message } = data;

        const intent = await conversationService.extractIntent(message);

        socket.emit('ai-suggestions-response', {
          intent: intent.intent,
          confidence: intent.confidence,
          suggestedTool: intent.suggested_tool,
          entities: intent.entities
        });

      } catch (error) {
        console.error('AI suggestions error:', error);
        socket.emit('error', { message: 'Failed to get suggestions' });
      }
    });

    // Health check for AI services
    socket.on('ai-health-check', async () => {
      try {
        const health = await conversationService.healthCheck();
        socket.emit('ai-health-status', health);
      } catch (error) {
        socket.emit('ai-health-status', {
          ollama: false,
          evynte: false,
          overall: false,
          error: error.message
        });
      }
    });

    // ========== END NEW HANDLERS ==========

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default setupSocketHandlers;
