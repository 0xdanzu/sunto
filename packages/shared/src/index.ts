export * from './types';

// Constants
export const CATEGORIES: Record<string, { name: string; slug: string }> = {
  'vibe-coding-tutorials': {
    name: 'Vibe Coding Tutorials',
    slug: 'vibe-coding-tutorials',
  },
  learning: {
    name: 'Learning',
    slug: 'learning',
  },
  inspiration: {
    name: 'Inspiration',
    slug: 'inspiration',
  },
  untagged: {
    name: 'Untagged',
    slug: 'untagged',
  },
};

// Tweet URL parsing
export function parseTweetUrl(url: string): { tweetId: string; username: string } | null {
  const patterns = [
    /(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/([^/]+)\/statuses\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        username: match[1],
        tweetId: match[2],
      };
    }
  }

  return null;
}

// Validate tweet URL
export function isValidTweetUrl(url: string): boolean {
  return parseTweetUrl(url) !== null;
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString();
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
