# Guessing Auction Landing Page

A Next.js application where users submit a single numeric guess to win an exclusive item. The guess closest to a secret target number wins.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

- **No Authentication Required**: Session-based identity via HTTP-only cookies
- **One Guess Per Person**: Each session can submit exactly one guess
- **Configurable**: Easy configuration via `auction.config.json`
- **Audio Preview**: Optional audio playback for the item
- **Fair Winner Selection**: Closest guess wins, earliest submission breaks ties
- **Admin Dashboard**: Calculate winner via secure API endpoint

## Configuration

Edit `auction.config.json` to customize:
- Item details (title, description, image)
- Guessing range (0-50000 by default)
- Deadline (UTC timestamp)
- Audio settings
- UI messages

Edit `.env.local` for secrets:
- `AUCTION_TARGET_NUMBER`: The secret target number
- `ADMIN_API_KEY`: Admin authentication key
- `SESSION_SECRET`: Session cookie signing key

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Session Management**: HTTP-only cookies
- **TypeScript**: Full type safety

## Documentation

See [PROJECT_README.md](./PROJECT_README.md) for comprehensive documentation including:
- API endpoints
- Database schema
- Winner calculation logic
- Security considerations
- Deployment instructions

## Project Structure

```
├── app/
│   ├── api/          # API routes (session, guess, status, result)
│   └── page.tsx      # Landing page
├── components/
│   └── AuctionForm.tsx
├── lib/
│   ├── db.ts         # Database operations
│   ├── session.ts    # Session management
│   ├── config.ts     # Configuration utilities
│   └── winner.ts     # Winner calculation
├── public/
│   ├── images/       # Item images
│   └── audio/        # Audio previews
└── auction.config.json
```

## License

MIT
