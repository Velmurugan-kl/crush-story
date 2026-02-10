import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, updateResponse, checkNameMatch } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { senderGuess } = await request.json();

    if (!senderGuess || typeof senderGuess !== 'string' || senderGuess.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sender guess is required' },
        { status: 400 }
      );
    }

    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);

    const isMatch = checkNameMatch(senderGuess);

    await updateResponse(session.id, {
      sender_guess: senderGuess.trim(),
      is_name_match: isMatch,
      current_page: 3,
    } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit sender error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit sender guess' },
      { status: 500 }
    );
  }
}
