import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resetAllData } from '@/lib/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token === (process.env.ADMIN_PASSWORD || 'changeme');
}

export async function POST() {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await resetAllData();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}
