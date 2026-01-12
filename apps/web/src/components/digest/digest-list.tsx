'use client';

import { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { DigestCard } from './digest-card';
import { EmptyState } from './empty-state';
import { Loader2 } from 'lucide-react';
import type { Tweet } from '@sunto/shared';

interface DigestListProps {
  userId: string;
}

export function DigestList({ userId }: DigestListProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTweets() {
      const supabase = createClientSupabaseClient();

      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('captured_at', { ascending: false })
        .limit(50);

      if (error) {
        setError(error.message);
      } else {
        const formattedTweets: Tweet[] = (data || []).map((row) => ({
          id: row.id,
          userId: row.user_id,
          tweetId: row.tweet_id,
          tweetUrl: row.tweet_url,
          authorHandle: row.author_handle || '',
          authorName: row.author_name || '',
          authorAvatar: row.author_avatar || undefined,
          contentType: row.content_type || 'single',
          rawText: row.raw_text || '',
          fullContent: row.full_content || '',
          hasVideo: row.has_video,
          videoTranscript: row.video_transcript || undefined,
          videoDurationSeconds: row.video_duration_seconds || undefined,
          articleUrl: row.article_url || undefined,
          articleContent: row.article_content || undefined,
          summary: row.summary || undefined,
          categoryId: row.category_id || undefined,
          category: row.category || undefined,
          capturedAt: row.captured_at,
          isRead: row.is_read,
          isStarred: row.is_starred,
        }));
        setTweets(formattedTweets);
      }

      setLoading(false);
    }

    fetchTweets();
  }, [userId]);

  const handleMarkRead = async (tweetId: string) => {
    const supabase = createClientSupabaseClient();
    await supabase
      .from('tweets')
      .update({ is_read: true })
      .eq('id', tweetId);

    setTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, isRead: true } : t))
    );
  };

  const handleToggleStar = async (tweetId: string) => {
    const tweet = tweets.find((t) => t.id === tweetId);
    if (!tweet) return;

    const supabase = createClientSupabaseClient();
    await supabase
      .from('tweets')
      .update({ is_starred: !tweet.isStarred })
      .eq('id', tweetId);

    setTweets((prev) =>
      prev.map((t) =>
        t.id === tweetId ? { ...t, isStarred: !t.isStarred } : t
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error loading digest: {error}</p>
      </div>
    );
  }

  if (tweets.length === 0) {
    return <EmptyState />;
  }

  const unreadTweets = tweets.filter((t) => !t.isRead);
  const readTweets = tweets.filter((t) => t.isRead);

  return (
    <div className="space-y-6">
      {unreadTweets.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            New ({unreadTweets.length})
          </h2>
          <div className="space-y-4">
            {unreadTweets.map((tweet) => (
              <DigestCard
                key={tweet.id}
                tweet={tweet}
                onMarkRead={handleMarkRead}
                onToggleStar={handleToggleStar}
              />
            ))}
          </div>
        </section>
      )}

      {readTweets.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Previously Read
          </h2>
          <div className="space-y-4">
            {readTweets.map((tweet) => (
              <DigestCard
                key={tweet.id}
                tweet={tweet}
                onMarkRead={handleMarkRead}
                onToggleStar={handleToggleStar}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
