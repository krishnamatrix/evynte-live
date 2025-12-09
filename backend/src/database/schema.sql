-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id VARCHAR(255) NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    organizer_email VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ai_enabled BOOLEAN DEFAULT true,
    allow_personalized_questions BOOLEAN DEFAULT true,
    allow_general_questions BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'attendee',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User-Event relationship table
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Messages table -- created on 
CREATE TABLE event_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    question TEXT NOT NULL,
    answer TEXT,
    question_type VARCHAR(50) DEFAULT 'general' CHECK (question_type IN ('personalized', 'general')),
    response_source VARCHAR(50) DEFAULT 'pending' CHECK (response_source IN ('ai', 'organizer', 'pending')),
    ai_confidence DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated')),
    answered_by VARCHAR(255),
    answered_at TIMESTAMP,
    saved_to_vector_db BOOLEAN DEFAULT false,
    vector_db_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS vector;
-- Q&A embeddings table with vector column for semantic search
CREATE TABLE qa_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    message_id UUID REFERENCES event_chat_messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    embedding vector(1024),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);



-- Indexes for better query performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_messages_event ON messages(event_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_event_status ON messages(event_id, status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_qa_embeddings_event ON qa_embeddings(event_id);
CREATE INDEX idx_qa_embeddings_message ON qa_embeddings(message_id);

-- Vector similarity search index using HNSW (Hierarchical Navigable Small World)
-- This dramatically speeds up similarity searches
CREATE INDEX idx_qa_embeddings_vector ON qa_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_embeddings_updated_at BEFORE UPDATE ON qa_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
-- Returns similar questions based on cosine similarity
CREATE OR REPLACE FUNCTION search_similar_questions(
    query_embedding vector(1024),
    event_uuid UUID,
    match_threshold DECIMAL DEFAULT 0.7,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    message_id UUID,
    question TEXT,
    answer TEXT,
    similarity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        qa.id,
        qa.message_id,
        qa.question,
        qa.answer,
        (1 - (qa.embedding <=> query_embedding))::DECIMAL as similarity
    FROM qa_embeddings qa
    WHERE qa.event_id = event_uuid
        AND (1 - (qa.embedding <=> query_embedding)) > match_threshold
    ORDER BY qa.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations with service role key (for backend)
CREATE POLICY "Service role can do everything on events" ON events
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on user_events" ON user_events
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on messages" ON messages
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on qa_embeddings" ON qa_embeddings
    FOR ALL USING (true);

-- Insert sample event for testing
INSERT INTO events (name, description, organizer_id, organizer_name, organizer_email, start_date, end_date)
VALUES (
    'Indicon 2025',
    'Annual technology conference',
    'org123',
    'Jane Smith',
    'jane@example.com',
    '2025-03-01 09:00:00',
    '2025-03-03 17:00:00'
);
