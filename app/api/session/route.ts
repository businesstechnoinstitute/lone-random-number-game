import { NextResponse } from 'next/server';
import { getOrCreateSession, getSessionId } from '@/lib/session';
import { getEntryBySessionId } from '@/lib/db';

export async function POST() {
  try {
    const sessionId = await getOrCreateSession();
    const existingEntry = getEntryBySessionId(sessionId);

    return NextResponse.json({
      sessionId,
      hasSubmitted: !!existingEntry,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json({
        sessionId: null,
        hasSubmitted: false,
      });
    }

    const existingEntry = getEntryBySessionId(sessionId);

    return NextResponse.json({
      sessionId,
      hasSubmitted: !!existingEntry,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
