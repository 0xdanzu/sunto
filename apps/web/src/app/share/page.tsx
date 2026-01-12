'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2, X } from 'lucide-react';
import { isValidTweetUrl } from '@sunto/shared';

type Status = 'capturing' | 'success' | 'error';

export default function SharePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('capturing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function captureShare() {
      // Get shared content from URL params (Web Share Target API)
      const url = searchParams.get('url');
      const text = searchParams.get('text');
      const title = searchParams.get('title');

      // Try to find a tweet URL in the shared content
      let tweetUrl = url;
      if (!tweetUrl && text) {
        // Extract URL from shared text
        const urlMatch = text.match(/https?:\/\/(?:twitter\.com|x\.com)\/[^\s]+/);
        if (urlMatch) {
          tweetUrl = urlMatch[0];
        }
      }

      if (!tweetUrl || !isValidTweetUrl(tweetUrl)) {
        setStatus('error');
        setError('No valid tweet URL found');
        return;
      }

      try {
        const response = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tweetUrl }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          // Auto-close after showing success
          setTimeout(() => {
            window.close();
            // Fallback if window.close() doesn't work (e.g., not opened as popup)
            router.push('/');
          }, 1500);
        } else {
          setStatus('error');
          setError(data.error || 'Failed to capture tweet');
        }
      } catch (err) {
        setStatus('error');
        setError('Network error. Please try again.');
      }
    }

    captureShare();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        {status === 'capturing' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Capturing tweet...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-medium">Captured!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You can close this window
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-medium">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Go to Digest
            </button>
          </>
        )}
      </div>
    </main>
  );
}
