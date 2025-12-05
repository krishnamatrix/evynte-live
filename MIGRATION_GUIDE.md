# Migration Guide: MongoDB + Pinecone → Supabase

This guide explains the changes made to switch from MongoDB + Pinecone to Supabase (PostgreSQL + pgvector).

## What Changed

### 1. Database
- **Before**: MongoDB with Mongoose ODM
- **After**: PostgreSQL via Supabase with direct SQL queries

### 2. Vector Database
- **Before**: Pinecone (separate service)
- **After**: pgvector extension in PostgreSQL (same database)

### 3. Benefits of This Change
✅ Single database for both relational data and vector search
✅ Lower costs (no separate vector DB service)
✅ Better transaction support
✅ Built-in real-time subscriptions (optional)
✅ Row Level Security for fine-grained access control
✅ Easier to manage (one service instead of two)

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to be provisioned (~2 minutes)

### 2. Enable pgvector Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for "vector"
3. Enable the `vector` extension

### 3. Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the entire contents of `backend/src/database/schema.sql`
3. Paste and execute
4. This creates:
   - All tables (events, users, messages, qa_embeddings, user_events)
   - Indexes (including HNSW vector index)
   - RLS policies
   - Custom functions (search_similar_questions)
   - Triggers for auto-updating timestamps

### 4. Get Credentials

1. Go to **Project Settings** → **API**
2. Copy three values:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon/public` key
   - `service_role` key (⚠️ Keep this secret!)

### 5. Update Environment Variables

Update your `backend/.env`:

```env
# Remove these:
# MONGODB_URI=...
# PINECONE_API_KEY=...
# PINECONE_ENVIRONMENT=...
# PINECONE_INDEX_NAME=...

# Add these:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 6. Install Dependencies

```bash
cd backend
npm install
```

This will install `@supabase/supabase-js` and remove `mongoose` and `@pinecone-database/pinecone`.

### 7. Test the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit http://localhost:5173 to test.

## Key Code Changes

### Models
**Before** (Mongoose):
```javascript
const event = new Event({ name: 'My Event' });
await event.save();
```

**After** (Supabase):
```javascript
const event = await Event.create({ name: 'My Event' });
```

### Vector Search
**Before** (Pinecone):
```javascript
const results = await index.query({
  vector: embedding,
  topK: 3,
  filter: { eventId: 'abc' }
});
```

**After** (pgvector):
```javascript
const results = await supabase.rpc('search_similar_questions', {
  query_embedding: embedding,
  event_uuid: 'abc',
  match_count: 3
});
```

### Database Queries
**Before** (Mongoose):
```javascript
const messages = await Message.find({ eventId: 'abc' })
  .sort({ createdAt: -1 })
  .limit(50);
```

**After** (Supabase):
```javascript
const messages = await Message.findByEvent('abc', { limit: 50 });
```

## Database Schema Comparison

### MongoDB Collections → PostgreSQL Tables

| MongoDB | PostgreSQL |
|---------|-----------|
| events | events |
| messages | messages |
| users | users |
| (none) | qa_embeddings |
| (none) | user_events |

### Field Name Changes

Due to PostgreSQL conventions (snake_case), some fields changed:

| MongoDB | PostgreSQL |
|---------|-----------|
| `eventId` | `event_id` |
| `userId` | `user_id` |
| `userName` | `user_name` |
| `userEmail` | `user_email` |
| `questionType` | `question_type` |
| `responseSource` | `response_source` |
| `aiConfidence` | `ai_confidence` |
| `answeredBy` | `answered_by` |
| `answeredAt` | `answered_at` |
| `savedToVectorDB` | `saved_to_vector_db` |
| `vectorDBId` | `vector_db_id` |
| `isActive` | `is_active` |

## Vector Search Performance

pgvector uses **HNSW** (Hierarchical Navigable Small World) index for fast approximate nearest neighbor search:

```sql
CREATE INDEX idx_qa_embeddings_vector ON qa_embeddings 
USING hnsw (embedding vector_cosine_ops);
```

This provides:
- Sub-millisecond query times
- Scales to millions of vectors
- Automatic index maintenance
- Built into PostgreSQL (no external service)

## Rollback Instructions

If you need to roll back to MongoDB + Pinecone:

1. Checkout the previous commit (before migration)
2. Run `npm install` in backend
3. Update `.env` with MongoDB and Pinecone credentials
4. Start the server

## Testing Vector Search

To test that vector search is working:

1. Create an event in Supabase dashboard or via API
2. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```
3. This adds 5 sample Q&A pairs
4. Ask a similar question in the frontend
5. You should get an AI response based on the seeded data

## Common Issues

### Issue: "relation 'events' does not exist"
**Solution**: Run the schema.sql file in Supabase SQL Editor

### Issue: "extension 'vector' is not available"
**Solution**: Enable pgvector extension in Supabase Dashboard → Database → Extensions

### Issue: "function search_similar_questions does not exist"
**Solution**: Make sure you ran the entire schema.sql file, not just the CREATE TABLE statements

### Issue: Vector search returns no results
**Solution**: 
- Check that embeddings are 1536 dimensions
- Verify HNSW index is created: `\di` in SQL Editor
- Check similarity threshold (default 0.75 may be too high)

## Performance Comparison

### Pinecone
- Separate service with API calls
- ~50-100ms per query (including network)
- Additional cost per query
- Requires separate maintenance

### pgvector
- Same database as relational data
- ~5-10ms per query (no network overhead)
- No additional cost
- Single service to maintain

## Next Steps

1. ✅ Test the application thoroughly
2. ✅ Verify vector search is working
3. ⏭️ Consider enabling Supabase Auth for user authentication
4. ⏭️ Use Supabase Realtime for live updates (optional)
5. ⏭️ Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
