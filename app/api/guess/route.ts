import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { createEntry, getEntryBySessionId } from '@/lib/db';
import { getConfig, isDeadlinePassed } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found. Please refresh the page.' },
        { status: 401 }
      );
    }

    // Check if deadline has passed
    if (isDeadlinePassed()) {
      return NextResponse.json(
        { error: 'Submissions are closed. The deadline has passed.' },
        { status: 403 }
      );
    }

    // Check if session has already submitted
    const existingEntry = getEntryBySessionId(sessionId);
    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already submitted a guess.' },
        { status: 400 }
      );
    }

    // Parse and validate guess
    const body = await request.json();
    const { guess } = body;

    if (typeof guess !== 'number' || !Number.isInteger(guess)) {
      return NextResponse.json(
        { error: 'Guess must be an integer.' },
        { status: 400 }
      );
    }

    // Validate range
    const config = getConfig();
    const { min_value, max_value } = config.auction.guessing;

    if (guess < min_value || guess > max_value) {
      return NextResponse.json(
        { error: `Guess must be between ${min_value} and ${max_value}.` },
        { status: 400 }
      );
    }

    // Create entry
    const entry = createEntry(sessionId, guess);

    return NextResponse.json({
      success: true,
      message: config.ui.confirmation_message,
      entry: {
        id: entry.id,
        guess_value: entry.guess_value,
        created_at: entry.created_at,
      },
    });
  } catch (error) {
    console.error('Error submitting guess:', error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'You have already submitted a guess.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit guess.' },
      { status: 500 }
    );
  }
}
