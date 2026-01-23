'use client';

import { useState, useEffect } from 'react';

interface AuctionFormProps {
  config: {
    auction: {
      item: {
        title: string;
        description: string;
        image_url: string;
      };
      guessing: {
        min_value: number;
        max_value: number;
      };
      timing: {
        deadline_utc: string;
      };
    };
    audio: {
      enabled: boolean;
      src: string;
      autoplay: boolean;
      loop: boolean;
    };
    ui: {
      confirmation_message: string;
      submission_closed_message: string;
    };
  };
}

export default function AuctionForm({ config }: AuctionFormProps) {
  const [started, setStarted] = useState(false);
  const [guess, setGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);

  useEffect(() => {
    // Initialize session and check status
    const initSession = async () => {
      try {
        await fetch('/api/session', { method: 'POST' });
        const statusRes = await fetch('/api/status');
        const status = await statusRes.json();
        setHasSubmitted(status.hasSubmitted);
        setSubmissionsOpen(status.submissionsOpen);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const guessValue = parseInt(guess, 10);

      if (isNaN(guessValue)) {
        setMessage('Please enter a valid number.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: guessValue }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setHasSubmitted(true);
      } else {
        setMessage(data.error || 'Failed to submit guess.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">
            {config.auction.item.title}
          </h1>
          <button
            onClick={() => setStarted(true)}
            className="px-12 py-4 bg-white text-purple-900 text-xl font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {config.auction.item.title}
        </h1>
        <p className="text-gray-600 mb-6">{config.auction.item.description}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">How it works:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Submit a single numeric guess</li>
            <li>
              • Deadline:{' '}
              {new Date(config.auction.timing.deadline_utc).toLocaleString()}
            </li>
            <li>• The closest guess to the secret number wins</li>
            <li>• Tie-breaker: earliest submission</li>
            <li>• One entry per person</li>
          </ul>
        </div>

        {config.audio.enabled && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Preview (Optional)
            </label>
            <audio
              controls
              className="w-full"
              src={config.audio.src}
              loop={config.audio.loop}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {!submissionsOpen ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {config.ui.submission_closed_message}
          </div>
        ) : hasSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            {config.ui.confirmation_message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="guess"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Guess ({config.auction.guessing.min_value} -{' '}
                {config.auction.guessing.max_value})
              </label>
              <input
                type="number"
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                min={config.auction.guessing.min_value}
                max={config.auction.guessing.max_value}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Enter your guess"
                disabled={submitting}
              />
            </div>

            {message && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  message.includes('error') || message.includes('Failed')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Guess'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
