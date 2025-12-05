# Quick Start Guide - AI Conversation

Get the new AI conversation features running in 5 minutes!

## Prerequisites Check

```bash
# 1. Check Node.js version (need 18+)
node --version

# 2. Check if Ollama is installed
which ollama

# 3. If not installed:
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh
# Windows: Download from https://ollama.com/download
```

## Step 1: Start Ollama (2 minutes)

```bash
# Terminal 1: Start Ollama server
ollama serve

# Terminal 2: Pull the model (one-time, ~4.7GB)
ollama pull llama3.1:8b

# Verify it's working
curl http://localhost:11434/api/tags
```

## Step 2: Configure Backend (1 minute)

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and add at minimum:
# - SUPABASE_URL (your Supabase project URL)
# - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)
# - OPENAI_API_KEY (for embeddings)
# - OLLAMA_BASE_URL=http://localhost:11434
# - OLLAMA_MODEL=llama3.1:8b
# - EVYNTE_API_URL=https://api.evynte.com
# - EVYNTE_API_KEY=your_key_here (get from Evynte team)
```

## Step 3: Install & Test (2 minutes)

```bash
# Install dependencies (if not done already)
npm install

# Run the AI test suite
npm run test:ai
```

Expected output:
```
🧪 Testing Evynte AI Conversation System

1️⃣  Testing Ollama Connection...
✅ Ollama is running
   Available models: llama3.1:8b
   Test response: Hello from Evynte!

2️⃣  Testing Evynte API Connection...
⚠️  Evynte API error: ...
   This is expected if EVYNTE_API_KEY is not configured

3️⃣  Testing MCP Tools...
✅ Found 10 MCP tools:
   - list_events: List all events...
   - get_event_details: Get detailed information...
   [etc.]

4️⃣  Testing Intent Extraction...
   [Shows intent analysis results]

6️⃣  Overall Health Check...
   - Ollama: ✅
   - Evynte API: ⚠️
   - Overall: ⚠️ Partial
```

## Step 4: Start the Server

```bash
# Development mode with auto-reload
npm run dev
```

Expected output:
```
MCP Server started successfully
Supabase connected successfully
Server running on port 5000
Socket.IO initialized
```

## Step 5: Test via WebSocket

### Option A: Use Frontend (if available)

```bash
cd ../frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Option B: Use Socket.IO Client

```javascript
// test-client.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected!');
  
  // Test AI chat
  socket.emit('ai-chat', {
    eventId: 'test-event',
    userId: 'test-user',
    userName: 'Test User',
    message: 'Hello, what can you help me with?',
    conversationHistory: []
  });
});

socket.on('ai-chat-stream', (data) => {
  console.log('Stream:', data);
});

socket.on('ai-chat-complete', (data) => {
  console.log('Complete:', data);
  process.exit(0);
});
```

Run it:
```bash
node test-client.js
```

## Quick Test Queries

Once connected, try these messages:

1. **Simple greeting**:
   ```
   "Hello, what can you do?"
   ```
   Expected: General introduction to capabilities

2. **List events** (requires Evynte API):
   ```
   "Show me all upcoming events"
   ```
   Expected: Calls `list_events` tool, returns formatted list

3. **Invoice operations** (requires Evynte API):
   ```
   "Resend invoice INV-12345"
   ```
   Expected: Calls `resend_invoice` tool, confirms email sent

4. **Health check**:
   ```javascript
   socket.emit('ai-health-check');
   ```
   Expected: Returns status of all services

## Troubleshooting

### "Ollama is not running"
```bash
# Check if process is running
ps aux | grep ollama

# Start it
ollama serve

# Or restart
pkill ollama && ollama serve
```

### "Model not found"
```bash
# List installed models
ollama list

# Pull the required model
ollama pull llama3.1:8b

# Try a different model
ollama pull llama2:13b
```

### "ECONNREFUSED localhost:11434"
```bash
# Verify Ollama is running and listening
lsof -i :11434

# Check Ollama logs
journalctl -u ollama -f  # Linux
```

### "Evynte API connection failed"
- This is **expected** until you configure `EVYNTE_API_KEY`
- The system will still work for conversational queries
- Tool execution will fail gracefully

### "Socket connection refused"
```bash
# Check backend is running
lsof -i :5000

# Check for errors in terminal
# Common: Port already in use
```

## What's Working Without Evynte API

Even without a configured Evynte API key, you can:
- ✅ Chat with Ollama LLM
- ✅ Test intent extraction
- ✅ See tool suggestions
- ✅ Test streaming responses
- ❌ Cannot execute actual API tools

## Next Steps

1. **Get Evynte API Key**: Contact the Evynte platform team
2. **Update Frontend**: Implement the new chat UI (see todo list)
3. **Add Conversation History**: Store chat history in database
4. **Deploy to Railway**: Follow deployment guide

## Full Documentation

- 📘 **AI_CONVERSATION_GUIDE.md** - Complete feature documentation
- 📋 **IMPLEMENTATION_SUMMARY.md** - What was built and how
- 📖 **README.md** - General project documentation

## Support

If you encounter issues:
1. Run `npm run test:ai` to diagnose
2. Check logs for error details
3. Verify all environment variables are set
4. Ensure Ollama is running and model is pulled
5. Test each service individually:
   ```bash
   # Test Ollama
   curl http://localhost:11434/api/tags
   
   # Test backend
   curl http://localhost:5000/api/events
   ```

---

**Time to first AI response**: ~5 minutes (if Ollama model already pulled)  
**Total setup time**: ~10 minutes including model download

🎉 **You're ready to go!** Start chatting with your AI assistant.
