import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStory, updateStory } from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token === (process.env.ADMIN_PASSWORD || 'changeme');
}

export async function GET() {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Story content is required' },
        { status: 400 }
      );
    }

    await updateStory(content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update story error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update story' },
      { status: 500 }
    );
  }
}
