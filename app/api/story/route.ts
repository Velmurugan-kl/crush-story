import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, getResponseBySessionId, getStory } from '@/lib/db';

export async function GET() {
  try {
    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);
    const response = await getResponseBySessionId(session.id);

    if (!response || !response.story_revealed) {
      return NextResponse.json(
        { success: false, error: 'Story not available yet' },
        { status: 403 }
      );
    }

    const story = await getStory();

    return NextResponse.json({
      success: true,
      story: story.content,
    });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get story' },
      { status: 500 }
    );
  }
}
