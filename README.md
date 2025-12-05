# Evynte AI Chat

A real-time event chat application with **AI-powered conversational assistant** and organizer fallback. This system features:
- **Full conversational AI** using Ollama LLM with Model Context Protocol (MCP)
- **Event Q&A system** with vector similarity search
- **Evynte platform integration** with 10+ API tools (events, invoices, tickets, attendees)
- **Real-time streaming responses** via WebSocket

## 🚀 What's New: AI Conversation Extension

The chat now supports **full conversational AI** powered by:
- **Ollama LLM** (llama3.1:8b) for natural language understanding
- **MCP Server** exposing Evynte platform APIs as tools
- **Tool execution** with live status updates
- **Invoice resend & download** capabilities
- **Streaming responses** for better UX

See [AI_CONVERSATION_GUIDE.md](./AI_CONVERSATION_GUIDE.md) for complete documentation.

## Features

### 🤖 Dual AI Systems

#### 1. **AI Conversation (NEW)** - Full platform assistant
- Natural language queries: "Show me upcoming events"
- Tool calling: Access to 10+ Evynte platform APIs
- Multi-step workflows: "Get event details and list attendees"
- Invoice operations: Resend, download, view details
- Streaming responses with status updates
- Conversation context awareness

#### 2. **Event Q&A** - Original Q&A system
- Automatic question answering using OpenAI GPT-4
- Semantic search using **pgvector** for similar questions
- Confidence scoring to determine when organizer input is needed

### 💬 Real-time Chat
- WebSocket-based communication using Socket.IO
- Live typing indicators
- Instant message delivery
- Streaming AI responses

### 🎯 Question Types
- **General Questions**: Shared with all attendees, saved to knowledge base for future AI responses
- **Personalized Questions**: Private responses visible only to the asker, not saved to vector DB
- **AI Chat**: Full conversational mode with tool execution

### 👥 Organizer Dashboard
- Real-time notification of escalated questions
- Quick response interface
- Option to save answers to knowledge base
- View pending and answered questions

### 🔧 Evynte Platform Tools

The MCP server exposes these API tools:
1. **list_events** - List all events with filtering
2. **get_event_details** - Detailed event information
3. **list_attendees** - Event attendee lists
4. **get_invoice** - Invoice details
5. **resend_invoice** - Resend invoice email
6. **download_invoice** - Get invoice download URL
7. **search_attendees** - Search across events
8. **get_event_stats** - Event analytics
9. **create_ticket** - Register new attendee
10. **cancel_ticket** - Cancel with refund

### 📊 Smart Escalation
- AI confidence threshold determines when to escalate
- Suggested answers provided to organizers
- Seamless handoff between AI and human responses

## Architecture

```
evynte-ai/
├── backend/                 # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── config/         # Supabase configuration
│   │   ├── database/       # PostgreSQL schema
│   │   ├── models/         # Database query modules
│   │   ├── mcp/            # MCP server (NEW)
│   │   ├── routes/         # REST API endpoints
│   │   ├── services/       # AI services (NEW: Ollama, Conversation, Evynte API)
│   │   ├── sockets/        # WebSocket handlers (UPDATED)
│   │   ├── scripts/        # Utility scripts
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React + Vite
    ├── src/
    │   ├── components/     # UI components
    │   ├── services/       # API & Socket clients
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **Supabase** - PostgreSQL database with pgvector
- **OpenAI API** - AI responses & embeddings
- **Ollama** - Local/self-hosted LLM (NEW)
- **MCP SDK** - Model Context Protocol (NEW)
- **pgvector** - Vector similarity search extension
- **Zod** - Schema validation (NEW)
- **Axios** - HTTP client for Evynte API (NEW)

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- **Ollama** installed ([Download](https://ollama.com))
- Supabase account
- OpenAI API key
- Evynte API key

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

Then pull the model:
```bash
ollama pull llama3.1:8b
```

Verify Ollama is running:
```bash
ollama serve
# In another terminal:
curl http://localhost:11434/api/tags
```

### 2. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable pgvector extension**:
   - Go to Database → Extensions
   - Search for "vector" and enable it

3. **Run the database schema**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the entire contents of `backend/src/database/schema.sql`
   - Execute the SQL to create all tables, indexes, and functions

4. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL`
   - Copy your `anon/public` key
   - Copy your `service_role` key (needed for backend)

### Backend Setup

### 3. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Ollama (NEW)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Evynte Platform API (NEW)
EVYNTE_API_URL=https://api.evynte.com
EVYNTE_API_KEY=your_evynte_api_key_here

# CORS
FRONTEND_URL=http://localhost:5173

# AI Configuration
AI_CONFIDENCE_THRESHOLD=0.75
MAX_VECTOR_RESULTS=3
```

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Database Schema

The application uses PostgreSQL with the following tables:

### Core Tables
- **events** - Event information and settings
- **users** - User profiles
- **messages** - Questions and answers
- **qa_embeddings** - Vector embeddings for semantic search
- **user_events** - Many-to-many relationship between users and events

### Key Features
- **pgvector** extension for semantic similarity search
- **HNSW index** for fast vector queries
- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamp triggers** for updated_at columns
- **Custom RPC function** `search_similar_questions()` for vector search

## Usage

### Attendee View (Chat Interface)

1. Navigate to `http://localhost:5173`
2. Select question type (General or Private)
3. Type your question and send
4. Receive AI response or wait for organizer if escalated

### Organizer View (Dashboard)

1. Navigate to `http://localhost:5173/organizer`
2. View pending questions that need attention
3. Click on a question to respond
4. Optionally save answer to knowledge base
5. Submit answer to send to attendee

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Messages
- `GET /api/messages/event/:eventId` - Get messages for an event
- `GET /api/messages/event/:eventId/pending` - Get pending questions
- `PUT /api/messages/:messageId/answer` - Update message with answer

### Health Check
- `GET /api/health` - Server health status

## WebSocket Events

### Client → Server
- `join-event` - Join an event room
- `send-question` - Send a new question
- `organizer-answer` - Organizer responds to question
- `typing` - Typing indicator

### Server → Client
- `receive-answer` - Receive answer to question
- `question-escalated` - Question sent to organizer
- `ai-processing` - AI is processing question
- `typing` - Another user is typing
- `user-joined` - User joined event
- `error` - Error occurred

## Seeding Vector Database

To populate the vector database with existing Q&A pairs:

```bash
cd backend
npm run seed
```

Or manually:
```bash
node src/scripts/seedVectorDB.js
```

## Configuration

### AI Confidence Threshold
Adjust `AI_CONFIDENCE_THRESHOLD` in `.env` (0.0 - 1.0)
- Higher values = more escalations to organizers
- Lower values = more AI responses
- Default: 0.75 (75% confidence required)

### Vector Search
The pgvector extension uses **cosine similarity** with **HNSW index** for fast similarity searches. The `search_similar_questions()` function handles:
- Event-specific filtering
- Similarity threshold filtering
- Result limiting

## How Vector Search Works

1. **Question Asked**: User submits a question
2. **Generate Embedding**: OpenAI creates a 1536-dimension vector
3. **Search Similar**: pgvector finds similar questions using cosine similarity
4. **Check Confidence**: Compare similarity score to threshold
5. **Respond or Escalate**:
   - High confidence → Return existing answer
   - Low confidence → Generate new answer or escalate to organizer
6. **Store if General**: Save general Q&A pairs to `qa_embeddings` table

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Security Considerations

⚠️ **Important**: This is a development setup. For production:

1. Implement proper authentication using Supabase Auth
2. Configure RLS policies for user-specific data access
3. Add rate limiting
4. Validate and sanitize all inputs
5. Use HTTPS/WSS
6. Implement user session management
7. Set up error tracking (e.g., Sentry)
8. Configure proper CORS policies
9. Use environment-specific API keys
10. Enable Supabase's built-in security features

## Supabase Features Used

- ✅ **PostgreSQL** - Relational database
- ✅ **pgvector** - Vector similarity search
- ✅ **Row Level Security** - Access control
- ✅ **Database Functions** - Custom RPC endpoints
- ✅ **Triggers** - Auto-update timestamps
- ✅ **Indexes** - HNSW for vector search, B-tree for queries

## Future Enhancements

- [ ] Supabase Auth integration
- [ ] Real-time subscriptions using Supabase Realtime
- [ ] Multi-language support
- [ ] File attachments using Supabase Storage
- [ ] Message reactions and threading
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced AI fine-tuning per event
- [ ] Sentiment analysis

## Troubleshooting

### Supabase Connection Issues
- Verify Project URL and API keys are correct
- Check that pgvector extension is enabled
- Ensure RLS policies allow service role access
- Check Supabase dashboard for connection limits

### Vector Search Errors
- Verify embeddings are 1536 dimensions (OpenAI ada-002)
- Check that HNSW index is created
- Ensure `search_similar_questions()` function exists
- Verify event IDs are valid UUIDs

### Socket.IO Connection Issues
- Check CORS settings in backend
- Verify frontend socket URL matches backend
- Check firewall settings

### OpenAI API Errors
- Verify API key is valid and has credits
- Check rate limits on your OpenAI account
- Ensure correct model name in aiService.js

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

