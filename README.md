# Sunto 寸評

> Transform your saved Twitter/X content into a daily digestible format

**Sunto** (Japanese: 寸評, meaning "brief comment" or "short summary") helps you capture tweets and get AI-powered summaries delivered to your personal digest.

## Features

- **iOS Share Sheet** - Share tweets directly from the X app
- **Chrome Extension** - Hover and click to capture tweets on desktop
- **AI Summaries** - Get TL;DR, key points, and insights via Claude AI
- **Video Transcription** - Automatic transcription of video tweets via Whisper
- **Smart Categories** - Auto-categorized into Coding, Learning, Inspiration
- **Dark Mode** - Beautiful dark theme following system preference
- **PWA Ready** - Install on your home screen for native app experience

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Mobile | PWA with Web Share Target |
| Extension | Chrome Extension Manifest V3 |
| Backend | Vercel Serverless Functions |
| Database | Supabase (PostgreSQL + Auth) |
| Auth | Google/Apple OAuth via Supabase |
| AI | Claude API (Anthropic), Whisper API (OpenAI) |

## Project Structure

```
sunto/
├── apps/
│   ├── web/                    # Next.js 14 PWA
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   └── lib/            # Utilities, AI, Supabase
│   │   └── public/             # Static assets, PWA manifest
│   │
│   └── extension/              # Chrome Extension MV3
│       ├── manifest.json
│       └── src/
│           ├── content/        # Inject capture button
│           ├── background/     # Service worker
│           └── popup/          # Extension popup UI
│
├── packages/
│   ├── shared/                 # TypeScript types & utilities
│   └── db/                     # Supabase schema & client
│
├── package.json                # Turborepo monorepo
├── turbo.json
├── SETUP.md                    # Setup guide
└── README.md
```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Core User Journey

```
CAPTURE (iOS/Desktop) → PROCESS (Extract + AI Summarize) → CONSUME (Evening Digest)
```

1. User sees interesting tweet
2. Shares to Sunto (via Share Sheet or Chrome extension)
3. Background processing extracts content and generates summary
4. View digest later with organized, summarized content

## API Costs

| Service | Monthly Cost |
|---------|-------------|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| Claude API | ~$0.30 |
| Whisper API | ~$3-4 (5 videos/day) |
| **Total** | **~$4-5/month** |

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](./LICENSE) for details.
