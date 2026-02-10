import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, getResponseBySessionId, updateResponse } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { feelings } = await request.json();

    if (typeof feelings !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Feelings answer is required' },
        { status: 400 }
      );
    }

    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);
    const response = await getResponseBySessionId(session.id);

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check qualification: name match AND feelings = true
    const isQualified = response.is_name_match && feelings;

    const updates: any = {
      feelings_answer: feelings,
      is_qualified: isQualified,
      current_page: 4,
    };

    // If qualified, start timer
    if (isQualified) {
      updates.timer_started_at = new Date().toISOString();
      updates.locked_to_final = true;
    }

    await updateResponse(session.id, updates);

    return NextResponse.json({ 
      success: true, 
      qualified: isQualified 
    });
  } catch (error) {
    console.error('Submit feelings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feelings' },
      { status: 500 }
    );
  }
}
