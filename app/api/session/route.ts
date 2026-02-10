import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, getOrCreateResponse, getResponseBySessionId } from '@/lib/db';

export async function GET() {
  try {
    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);
    const response = await getOrCreateResponse(session.id);

    return NextResponse.json({
      success: true,
      response: {
        current_page: response.current_page,
        locked_to_final: response.locked_to_final,
        is_qualified: response.is_qualified,
        timer_completed: response.timer_completed,
      },
    });
  } catch (error) {
    console.error('Session init error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize session' },
      { status: 500 }
    );
  }
}
