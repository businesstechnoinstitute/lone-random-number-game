import { NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { getEntryBySessionId } from '@/lib/db';
import { isDeadlinePassed, getConfig } from '@/lib/config';

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const config = getConfig();
    const deadlinePassed = isDeadlinePassed();

    let hasSubmitted = false;
    if (sessionId) {
      const existingEntry = getEntryBySessionId(sessionId);
      hasSubmitted = !!existingEntry;
    }

    return NextResponse.json({
      submissionsOpen: !deadlinePassed,
      hasSubmitted,
      deadline: config.auction.timing.deadline_utc,
    });
  } catch (error) {
    console.error('Error getting status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
