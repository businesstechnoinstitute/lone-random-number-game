# Single Item Guessing Auction Landing Page

A Next.js application where users submit a single numeric guess to win an exclusive item. The guess closest to a secret target number wins.

## Features

- Session-based identity management (no external authentication)
- One entry per session
- Configurable guessing range
- Audio preview support
- Server-side winner calculation
- Deadline enforcement
- SQLite database for entries

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and set your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
AUCTION_TARGET_NUMBER=25000
ADMIN_API_KEY=your-secret-admin-key
SESSION_SECRET=your-session-secret
```

**Important:** Never expose `AUCTION_TARGET_NUMBER` to the client.

### 3. Configure Auction Settings

Edit `auction.config.json` to customize:

- Item details (title, description, image)
- Guessing range (min/max values)
- Deadline (UTC timestamp)
- Audio settings
- UI messages

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── session/route.ts    # Session management
│   │   ├── guess/route.ts      # Guess submission
│   │   ├── status/route.ts     # Check submission status
│   │   └── result/route.ts     # Calculate winner (admin only)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   └── AuctionForm.tsx         # Client-side form component
├── lib/
│   ├── db.ts                   # SQLite database operations
│   ├── session.ts              # Session utilities
│   ├── config.ts               # Configuration utilities
│   └── winner.ts               # Winner calculation logic
├── public/
│   ├── images/                 # Item images
│   └── audio/                  # Audio preview files
├── auction.config.json         # Auction configuration
└── .env.local                  # Environment variables
```

## API Endpoints

### POST /api/session
Creates or retrieves the current session.

**Response:**
```json
{
  "sessionId": "uuid",
  "hasSubmitted": false
}
```

### GET /api/status
Returns the current auction status.

**Response:**
```json
{
  "submissionsOpen": true,
  "hasSubmitted": false,
  "deadline": "2026-02-01T18:00:00Z"
}
```

### POST /api/guess
Submit a guess (requires session).

**Request:**
```json
{
  "guess": 25000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your entry has been submitted.",
  "entry": {
    "id": "uuid",
    "guess_value": 25000,
    "created_at": "2026-01-23T12:00:00Z"
  }
}
```

### GET /api/result
Calculate and return the winner (admin only).

**Headers:**
```
x-admin-key: your-admin-key
```

**Response:**
```json
{
  "winner": {
    "id": "uuid",
    "session_id": "uuid",
    "guess_value": 24999,
    "created_at": "2026-01-23T12:00:00Z"
  },
  "targetNumber": 25000,
  "totalEntries": 150
}
```

## Database

The application uses SQLite with a single `entries` table:

| Column       | Type      | Notes                |
|--------------|-----------|----------------------|
| id           | TEXT      | Primary key (UUID)   |
| session_id   | TEXT      | Unique constraint    |
| guess_value  | INTEGER   | User's guess         |
| created_at   | TEXT      | ISO timestamp        |
| updated_at   | TEXT      | ISO timestamp        |

Database file: `auction.db` (auto-created on first run)

## Winner Calculation

The winner is determined by:

1. Calculate absolute difference: `|guess - target|`
2. Sort by difference (ascending)
3. Tie-breaker: earliest `created_at` timestamp

## Security Considerations

- Target number stored only in server environment
- Session cookies are HTTP-only and secure
- Deadline enforced server-side
- Unique constraint prevents duplicate submissions
- Admin API requires authentication header

## Optional: Publish Target Hash

For transparency, you can publish a hash of the target number before launch:

```bash
echo -n "25000" | sha256sum
```

Add to `auction.config.json`:
```json
{
  "auction": {
    "target": {
      "value": null,
      "hash_algorithm": "sha256",
      "publish_hash": true
    }
  }
}
```

After the deadline, reveal the target number to verify integrity.

## Customization

### Change Item Details

Edit `auction.config.json`:

```json
{
  "auction": {
    "item": {
      "title": "Your Item Name",
      "description": "Your description",
      "image_url": "/images/your-item.jpg"
    }
  }
}
```

Add your image to `public/images/`

### Change Guessing Range

Edit `auction.config.json`:

```json
{
  "auction": {
    "guessing": {
      "min_value": 1,
      "max_value": 100000
    }
  }
}
```

### Add Audio Preview

1. Add audio file to `public/audio/`
2. Edit `auction.config.json`:

```json
{
  "audio": {
    "enabled": true,
    "src": "/audio/your-preview.mp3"
  }
}
```

## Testing Locally

1. Set a known target number in `.env.local`:
   ```env
   AUCTION_TARGET_NUMBER=500
   ```

2. Submit multiple guesses using different browsers or incognito windows

3. Check the winner:
   ```bash
   curl -H "x-admin-key: your-admin-key" http://localhost:3000/api/result
   ```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note:** SQLite may not persist on serverless platforms. Consider migrating to PostgreSQL for production.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t auction-app .
docker run -p 3000:3000 -e AUCTION_TARGET_NUMBER=25000 auction-app
```

## License

MIT
