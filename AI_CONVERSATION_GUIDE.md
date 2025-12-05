# AI Conversation Extension Guide

This guide covers the new AI-powered conversational chat feature that extends the original event Q&A system.

## Overview

The Evynte AI Chat now supports **full conversational AI** powered by:
- **Ollama LLM** (llama3.1:8b or other models) for natural language understanding
- **Model Context Protocol (MCP)** for exposing Evynte platform APIs as tools
- **Real-time streaming** responses via WebSocket
- **Tool execution** with live status updates

## Architecture

```
User Message 
    ↓
Socket.IO (ai-chat event)
    ↓
Conversation Service
    ↓
Ollama LLM → Extracts intent & determines tools needed
    ↓
MCP Server → Executes API tools (list events, get invoice, etc.)
    ↓
Evynte API Client → Calls actual platform APIs
    ↓
Ollama LLM → Formats results into natural language
    ↓
Socket.IO (streaming) → Returns to user
```

## New Services

### 1. **MCP Server** (`backend/src/mcp/server.js`)

Exposes 10 Evynte platform tools:

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_events` | List all events with filtering | status, limit |
| `get_event_details` | Get detailed event info | eventId |
| `list_attendees` | List event attendees | eventId, status |
| `get_invoice` | Get invoice details | invoiceId |
| `resend_invoice` | Resend invoice email | invoiceId, email (optional) |
| `download_invoice` | Get invoice download URL | invoiceId, format |
| `search_attendees` | Search across all events | query, eventId (optional) |
| `get_event_stats` | Get event analytics | eventId |
| `create_ticket` | Register new attendee | eventId, attendee, ticketType |
| `cancel_ticket` | Cancel ticket with refund | ticketId, reason, processRefund |

### 2. **Ollama Service** (`backend/src/services/ollamaService.js`)

Handles LLM interactions:
- **`chat()`** - Non-streaming chat completions with tool calling
- **`chatStream()`** - Streaming responses with real-time updates
- **`extractIntent()`** - Extract user intent and entities
- **`formatToolResults()`** - Format API results into natural language
- **`healthCheck()`** - Verify Ollama is running
- **`ensureModel()`** - Pull model if not available

### 3. **Evynte API Client** (`backend/src/services/evynteAPI.js`)

Axios-based client for Evynte platform:
- Authentication with API key
- Error handling and retries
- All CRUD operations for events, attendees, invoices
- Invoice resend and download functionality

### 4. **Conversation Service** (`backend/src/services/conversationService.js`)

Orchestrates the full conversation flow:
- **`processMessage()`** - Complete pipeline (non-streaming)
- **`processMessageStream()`** - Streaming pipeline with status updates
- **`executeTools()`** - Call MCP tools and handle results
- **`healthCheck()`** - Check all service health

## WebSocket Events

### Client → Server

#### `ai-chat` (Streaming conversation)
```javascript
socket.emit('ai-chat', {
  eventId: 'evt-123',
  userId: 'user-456',
  userName: 'John Doe',
  message: 'Show me upcoming events',
  conversationHistory: [
    { role: 'user', content: 'Previous message' },
    { role: 'assistant', content: 'Previous response' }
  ]
});
```

#### `ai-chat-simple` (Non-streaming, faster)
```javascript
socket.emit('ai-chat-simple', {
  eventId: 'evt-123',
  userId: 'user-456',
  userName: 'John Doe',
  message: 'Show me my invoice',
  conversationHistory: []
});
```

#### `ai-suggestions` (Get intent analysis)
```javascript
socket.emit('ai-suggestions', {
  message: 'I need to download my invoice'
});
```

#### `ai-health-check`
```javascript
socket.emit('ai-health-check');
```

### Server → Client

#### `ai-chat-status` (Processing updates)
```javascript
{
  status: 'processing' | 'executing_tools',
  message: 'Thinking...' | 'Calling Evynte APIs...',
  tools: ['list_events', 'get_invoice'], // when executing
  count: 2 // number of tools
}
```

#### `ai-chat-stream` (Streaming content)
```javascript
{
  type: 'content' | 'final_content',
  content: 'Here are your upcoming events...'
}
```

#### `ai-chat-tools` (Tool execution results)
```javascript
{
  results: [
    { tool: 'list_events', success: true, summary: 'Success' },
    { tool: 'get_invoice', success: true, summary: 'Success' }
  ]
}
```

#### `ai-chat-complete` (Final response)
```javascript
{
  fullResponse: 'Here are your upcoming events: ...',
  toolExecutions: [
    { tool: 'list_events', success: true },
    { tool: 'get_invoice', success: true }
  ]
}
```

#### `ai-chat-response` (Non-streaming response)
```javascript
{
  content: 'Your invoice has been sent to your email.',
  toolCalls: ['resend_invoice'],
  sources: ['resend_invoice']
}
```

#### `ai-chat-error`
```javascript
{
  message: 'Failed to process your message',
  error: 'Ollama connection timeout'
}
```

#### `ai-suggestions-response`
```javascript
{
  intent: 'download_invoice',
  confidence: 0.95,
  suggestedTool: 'download_invoice',
  entities: { invoiceId: 'inv-123' }
}
```

#### `ai-health-status`
```javascript
{
  ollama: true,
  evynte: true,
  overall: true
}
```

## Environment Variables

Add to `.env`:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Evynte Platform API
EVYNTE_API_URL=https://api.evynte.com
EVYNTE_API_KEY=your_evynte_api_key_here
```

## Setup Instructions

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
ollama serve
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### 2. Pull the model
```bash
ollama pull llama3.1:8b
```

Or use a different model:
```bash
ollama pull llama2:13b
ollama pull mistral:7b
```

### 3. Verify Ollama is running
```bash
curl http://localhost:11434/api/tags
```

### 4. Start the backend
```bash
cd backend
npm install
npm run dev
```

## Usage Examples

### Example 1: List Events
**User:** "Show me all upcoming events"

**Flow:**
1. Ollama extracts intent: `list_events`
2. MCP calls `list_events` tool with `status: 'upcoming'`
3. Evynte API returns event list
4. Ollama formats: "Here are your upcoming events: [list]"

### Example 2: Resend Invoice
**User:** "Can you resend invoice INV-12345 to me?"

**Flow:**
1. Ollama extracts: `resend_invoice`, entity: `invoiceId: 'INV-12345'`
2. MCP calls `resend_invoice('INV-12345')`
3. Evynte API sends email
4. Ollama formats: "✓ Invoice INV-12345 has been sent to your email"

### Example 3: Multi-tool Query
**User:** "Show me my event details and list all attendees"

**Flow:**
1. Ollama decides to call 2 tools: `get_event_details`, `list_attendees`
2. Both tools execute in parallel
3. Results combined and formatted
4. Response: "Event: [details]. Attendees: [list]"

## Testing

### Test MCP Tools
```bash
node -e "
import('./backend/src/services/evynteAPI.js').then(async (module) => {
  const api = module.evynteAPI;
  const events = await api.listEvents('upcoming', 5);
  console.log('Events:', events);
});
"
```

### Test Ollama
```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [{"role": "user", "content": "Hello!"}]
}'
```

### Test Conversation Service
```javascript
import { conversationService } from './backend/src/services/conversationService.js';

const response = await conversationService.processMessage(
  'Show me upcoming events',
  []
);
console.log(response);
```

## Frontend Integration

Update `ChatInterface.jsx` to use new events:

```javascript
import { socket } from '../services/socket';

// Send AI chat message
const sendAIMessage = (message, history) => {
  socket.emit('ai-chat', {
    eventId: currentEvent.id,
    userId: user.id,
    userName: user.name,
    message,
    conversationHistory: history
  });
};

// Listen for streaming responses
socket.on('ai-chat-stream', (data) => {
  if (data.type === 'content') {
    appendToLastMessage(data.content);
  }
});

socket.on('ai-chat-status', (data) => {
  showStatus(data.message);
  if (data.tools) {
    showToolsExecuting(data.tools);
  }
});

socket.on('ai-chat-complete', (data) => {
  markMessageComplete(data.fullResponse);
});
```

## Performance

- **Ollama Response Time:** 1-3 seconds (depends on model)
- **Tool Execution:** 100-500ms per API call
- **Streaming:** Chunks every 50-100ms
- **Total Latency:** 2-5 seconds for complex queries

## Troubleshooting

### Ollama not connecting
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
ollama serve
```

### Model not found
```bash
# List installed models
ollama list

# Pull required model
ollama pull llama3.1:8b
```

### Evynte API errors
- Check `EVYNTE_API_KEY` is valid
- Verify `EVYNTE_API_URL` is correct
- Check network connectivity

### Tool execution fails
- Verify MCP server started: Check logs for "MCP Server started successfully"
- Test individual tools via conversation service
- Check Evynte API client health: `evynteAPI.healthCheck()`

## Production Deployment (Railway)

### Option 1: Separate Ollama + Backend

1. **Deploy Ollama container:**
```dockerfile
FROM ollama/ollama:latest
RUN ollama pull llama3.1:8b
EXPOSE 11434
CMD ["ollama", "serve"]
```

2. **Point backend to Ollama service:**
```bash
OLLAMA_BASE_URL=https://ollama-service.railway.app
```

### Option 2: Combined Container

```dockerfile
FROM node:18-alpine

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy app
COPY backend /app
WORKDIR /app

# Install deps
RUN npm install

# Pull model
RUN ollama pull llama3.1:8b

# Start both services
CMD ollama serve & npm start
```

## Migration from Old Q&A System

The new AI chat **coexists** with the original Q&A system:

| Feature | Original Q&A | New AI Chat |
|---------|-------------|-------------|
| Socket Event | `send-question` | `ai-chat` |
| Response Type | Single answer | Conversational |
| Tools | None | 10 Evynte APIs |
| Streaming | No | Yes |
| Context | Single question | Full history |

**To use both:**
- Keep existing `send-question` for simple Q&A
- Use `ai-chat` for complex queries needing API access
- Frontend can detect query type and use appropriate event

## Advanced Features

### Custom Tool Creation

Add new tools to MCP server:

```javascript
{
  name: 'send_notification',
  description: 'Send push notification to attendees',
  inputSchema: {
    type: 'object',
    properties: {
      eventId: { type: 'string' },
      message: { type: 'string' },
      targetGroup: { type: 'string', enum: ['all', 'vip', 'speakers'] }
    },
    required: ['eventId', 'message']
  }
}
```

Then implement in `evynteAPI.js`:
```javascript
async sendNotification(eventId, message, targetGroup) {
  // Implementation
}
```

### Conversation Context Management

Store conversation history in database:

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  messages JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Custom Prompts

Modify system prompt in `conversationService.js`:

```javascript
const systemPrompt = `You are an AI assistant for Evynte.
PERSONALITY: Professional, helpful, concise
CAPABILITIES: Event management, ticket sales, invoices
CONSTRAINTS: Cannot modify user data without confirmation
TONE: Friendly but professional`;
```

## Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Llama 3.1 Model Card](https://ai.meta.com/blog/meta-llama-3-1/)
- [Socket.IO Guide](https://socket.io/docs/v4/)

## Support

For issues or questions:
1. Check logs: `backend/logs/`
2. Test health endpoints
3. Verify environment variables
4. Review socket event payloads
