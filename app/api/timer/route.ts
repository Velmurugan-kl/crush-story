import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, getResponseBySessionId, getRemainingSeconds, updateResponse } from '@/lib/db';

export async function GET() {
  try {
    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);
    const response = await getResponseBySessionId(session.id);

    if (!response || !response.is_qualified) {
      return NextResponse.json(
        { success: false, error: 'Not qualified for timer' },
        { status: 403 }
      );
    }

    const remainingSeconds = getRemainingSeconds(response);

    // Mark timer as completed if time is up
    if (remainingSeconds === 0 && !response.timer_completed) {
      await updateResponse(session.id, {
        timer_completed: true,
        story_revealed: true,
      } as any);
    }

    return NextResponse.json({
      success: true,
      remainingSeconds,
      timerCompleted: remainingSeconds === 0,
      storyRevealed: remainingSeconds === 0,
    });
  } catch (error) {
    console.error('Timer status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get timer status' },
      { status: 500 }
    );
  }
}
