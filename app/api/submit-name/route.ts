import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';
import { getOrCreateSession, updateResponse } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const sessionToken = await getSessionToken();
    const session = await getOrCreateSession(sessionToken);

    await updateResponse(session.id, {
      name_input: name.trim(),
      current_page: 2,
    } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit name error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit name' },
      { status: 500 }
    );
  }
}
