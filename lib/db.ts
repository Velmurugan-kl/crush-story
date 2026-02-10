import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Session {
  id: string;
  session_token: string;
  created_at: Date;
}

export interface Response {
  id: number;
  session_id: string;
  name_input: string | null;
  sender_guess: string | null;
  feelings_answer: boolean | null;
  current_page: number;
  is_name_match: boolean;
  is_qualified: boolean;
  timer_started_at: Date | null;
  timer_duration_seconds: number;
  timer_completed: boolean;
  story_revealed: boolean;
  locked_to_final: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Story {
  id: number;
  content: string;
  updated_at: Date;
}

// Create or get session
export async function getOrCreateSession(sessionToken: string): Promise<Session> {
  const result = await sql`
    INSERT INTO sessions (session_token)
    VALUES (${sessionToken})
    ON CONFLICT (session_token) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  return result.rows[0] as Session;
}

// Get or create response for session
export async function getOrCreateResponse(sessionId: string): Promise<Response> {
  const result = await sql`
    INSERT INTO responses (session_id)
    VALUES (${sessionId})
    ON CONFLICT (session_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  return result.rows[0] as Response;
}

// Get response by session ID
export async function getResponseBySessionId(sessionId: string): Promise<Response | null> {
  const result = await sql`
    SELECT * FROM responses WHERE session_id = ${sessionId} LIMIT 1;
  `;
  return result.rows[0] as Response || null;
}

// Update response
export async function updateResponse(
  sessionId: string,
  updates: Partial<Response>
): Promise<Response> {
  const fields = Object.keys(updates)
    .filter(key => key !== 'id' && key !== 'session_id' && key !== 'created_at')
    .map(key => `${key} = ${updates[key as keyof Response] === null ? 'NULL' : `'${updates[key as keyof Response]}'`}`)
    .join(', ');

  // Build update query dynamically
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'session_id' && key !== 'created_at') {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  values.push(sessionId);

  const query = `
    UPDATE responses 
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE session_id = $${paramIndex}
    RETURNING *;
  `;

  const result = await sql.query(query, values);
  return result.rows[0] as Response;
}

// Check if name matches "vel"
export function checkNameMatch(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  return normalized.includes('vel') || 
         normalized.includes('velu') || 
         normalized.includes('velmurugan');
}

// Get remaining timer seconds
export function getRemainingSeconds(response: Response): number {
  if (!response.timer_started_at) return response.timer_duration_seconds;
  
  const startTime = new Date(response.timer_started_at).getTime();
  const currentTime = Date.now();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  const remaining = response.timer_duration_seconds - elapsedSeconds;
  
  return Math.max(0, remaining);
}

// Get story
export async function getStory(): Promise<Story> {
  const result = await sql`SELECT * FROM story ORDER BY id DESC LIMIT 1;`;
  return result.rows[0] as Story;
}

// Update story
export async function updateStory(content: string): Promise<Story> {
  const result = await sql`
    UPDATE story SET content = ${content}, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM story ORDER BY id DESC LIMIT 1)
    RETURNING *;
  `;
  return result.rows[0] as Story;
}

// Get all responses (admin)
export async function getAllResponses(): Promise<Response[]> {
  const result = await sql`
    SELECT * FROM responses ORDER BY created_at DESC;
  `;
  return result.rows as Response[];
}

// Reset all data (admin)
export async function resetAllData(): Promise<void> {
  await sql`TRUNCATE TABLE responses CASCADE;`;
  await sql`TRUNCATE TABLE sessions CASCADE;`;
  await sql`
    UPDATE story 
    SET content = 'Your story will appear here after the timer completes...', 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM story ORDER BY id DESC LIMIT 1);
  `;
}
