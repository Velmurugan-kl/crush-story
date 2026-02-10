const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    console.log('Creating database schema...');

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create responses table
    await sql`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        name_input VARCHAR(255),
        sender_guess VARCHAR(255),
        feelings_answer BOOLEAN,
        current_page INTEGER DEFAULT 1,
        is_name_match BOOLEAN DEFAULT FALSE,
        is_qualified BOOLEAN DEFAULT FALSE,
        timer_started_at TIMESTAMP WITH TIME ZONE,
        timer_duration_seconds INTEGER DEFAULT 120,
        timer_completed BOOLEAN DEFAULT FALSE,
        story_revealed BOOLEAN DEFAULT FALSE,
        locked_to_final BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id)
      );
    `;

    // Create story table
    await sql`
      CREATE TABLE IF NOT EXISTS story (
        id SERIAL PRIMARY KEY,
        content TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert default story if not exists
    await sql`
      INSERT INTO story (content)
      SELECT 'Your story will appear here after the timer completes...'
      WHERE NOT EXISTS (SELECT 1 FROM story LIMIT 1);
    `;

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_responses_qualified ON responses(is_qualified);
    `;

    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
