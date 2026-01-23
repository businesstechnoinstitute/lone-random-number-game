import { NextRequest, NextResponse } from 'next/server';
import { calculateWinner } from '@/lib/winner';
import { isDeadlinePassed } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication
    const adminKey = request.headers.get('x-admin-key');
    const expectedAdminKey = process.env.ADMIN_API_KEY;

    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Optional: Only allow after deadline
    if (!isDeadlinePassed()) {
      return NextResponse.json(
        { error: 'Results are not available until after the deadline.' },
        { status: 403 }
      );
    }

    const result = calculateWinner();

    return NextResponse.json({
      winner: result.winner
        ? {
            id: result.winner.id,
            session_id: result.winner.session_id,
            guess_value: result.winner.guess_value,
            created_at: result.winner.created_at,
          }
        : null,
      targetNumber: result.targetNumber,
      totalEntries: result.totalEntries,
    });
  } catch (error) {
    console.error('Error calculating winner:', error);
    return NextResponse.json(
      { error: 'Failed to calculate winner' },
      { status: 500 }
    );
  }
}
