import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllResponses } from '@/lib/db';

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

    const responses = await getAllResponses();

    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Get responses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get responses' },
      { status: 500 }
    );
  }
}
