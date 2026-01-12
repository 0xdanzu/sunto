# Sunto Setup Guide

This guide walks you through setting up Sunto for local development and deployment.

## Prerequisites

- Node.js 18+
- npm 10+
- Supabase account (free tier works)
- Anthropic API key (for Claude)
- OpenAI API key (for Whisper - optional, for video transcription)

## 1. Clone and Install

```bash
git clone https://github.com/yourusername/sunto.git
cd sunto
npm install
```

## 2. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `packages/db/schema/schema.sql`
3. Run the SQL to create tables and policies

### Configure Auth Providers

1. Go to Authentication > Providers
2. Enable Google OAuth:
   - Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable Apple OAuth (optional):
   - Configure at [Apple Developer Portal](https://developer.apple.com)

## 3. Environment Variables

Copy the example env file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-key

# OpenAI (for Whisper transcription)
OPENAI_API_KEY=sk-your-key

# App URL (use localhost for dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook secret (generate a random string)
WEBHOOK_SECRET=your-random-secret
```

## 4. Run Development Server

```bash
npm run dev
```

The web app will be available at `http://localhost:3000`

## 5. Chrome Extension Setup

### Load Unpacked Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `apps/extension` folder

### Configure Extension

For local development, update the API URLs in the extension:

1. Edit `apps/extension/src/content/content.js`:
   ```js
   const API_URL = 'http://localhost:3000/api';
   ```

2. Edit `apps/extension/src/background/service-worker.js`:
   ```js
   const API_URL = 'http://localhost:3000/api';
   ```

3. Edit `apps/extension/manifest.json` to add localhost permissions:
   ```json
   "host_permissions": [
     "https://twitter.com/*",
     "https://x.com/*",
     "http://localhost:3000/*"
   ]
   ```

## 6. PWA Setup (iOS Share Sheet)

### Local Testing

1. Run the dev server with HTTPS (required for PWA):
   ```bash
   npm run dev -- --experimental-https
   ```

2. Access via your local IP: `https://192.168.x.x:3000`
3. On iPhone, open Safari and navigate to the URL
4. Tap Share > Add to Home Screen

### Production

The PWA manifest (`apps/web/public/manifest.json`) is already configured for the Share Target API. After deploying, users can:

1. Visit your domain on iOS Safari
2. Tap Share > Add to Home Screen
3. "Sunto" will appear in the share sheet

## 7. Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Update Production URLs

After deployment:

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Update Supabase redirect URLs for OAuth
3. Rebuild the Chrome extension with production API URL
4. Submit extension to Chrome Web Store (optional)

## API Keys

### Anthropic Claude API

1. Sign up at [anthropic.com](https://anthropic.com)
2. Get API key from Console > API Keys
3. Recommended model: `claude-3-5-haiku-20241022` (fast, cheap)

### OpenAI Whisper API

1. Sign up at [openai.com](https://openai.com)
2. Get API key from API Keys section
3. Used for video transcription (~$0.006/minute)

## Troubleshooting

### Extension not capturing tweets

- Check console for errors (right-click extension icon > Inspect)
- Verify host permissions include twitter.com and x.com
- Ensure you're logged in to Sunto

### OAuth not redirecting

- Verify redirect URLs in Supabase match your app URL
- Check browser console for CORS errors
- Ensure cookies are enabled

### AI summaries not working

- Verify ANTHROPIC_API_KEY is set correctly
- Check Vercel function logs for errors
- Ensure content is being extracted (check database)

## Development Tips

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Database Types

After changing the schema, regenerate types:

```bash
npx supabase gen types typescript --project-id your-project-id > packages/db/src/types.ts
```

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/sunto/issues)
- Documentation: See project README
