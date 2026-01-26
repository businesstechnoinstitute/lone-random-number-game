import { getAllEntries, Entry } from './db';
import { getTargetNumber } from './config';

export interface WinnerResult {
  winner: Entry | null;
  targetNumber: number;
  totalEntries: number;
}

export function calculateWinner(): WinnerResult {
  const entries = getAllEntries();
  const targetNumber = getTargetNumber();

  if (entries.length === 0) {
    return {
      winner: null,
      targetNumber,
      totalEntries: 0,
    };
  }

  // Calculate difference for each entry and sort
  const entriesWithDiff = entries.map((entry) => ({
    entry,
    diff: Math.abs(entry.guess_value - targetNumber),
  }));

  // Sort by difference (ascending) and then by created_at (ascending) for tie breaker
  entriesWithDiff.sort((a, b) => {
    if (a.diff !== b.diff) {
      return a.diff - b.diff;
    }
    // Tie breaker: earliest submission wins
    return new Date(a.entry.created_at).getTime() - new Date(b.entry.created_at).getTime();
  });

  return {
    winner: entriesWithDiff[0].entry,
    targetNumber,
    totalEntries: entries.length,
  };
}
