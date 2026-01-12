import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { summarizeTweet } from '@/lib/ai/summarize';
import type { Database } from '@sunto/db';
import type { ContentType } from '@sunto/shared';

// Service client for webhook processing
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

interface WebhookPayload {
  userId: string;
  tweetId: string;
  tweetUrl: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  rawText: string;
  fullContent: string;
  contentType: ContentType;
  hasVideo: boolean;
  videoUrl?: string;
  videoDurationSeconds?: number;
  articleUrl?: string;
  articleContent?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.WEBHOOK_SECRET}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload: WebhookPayload = await request.json();

    // Validate required fields
    if (!payload.userId || !payload.tweetId || !payload.tweetUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Check for existing tweet
    const { data: existing } = await supabase
      .from('tweets')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('tweet_id', payload.tweetId)
      .single();

    if (existing) {
      // Update existing record with extracted content
      await supabase
        .from('tweets')
        .update({
          author_name: payload.authorName,
          author_handle: payload.authorHandle,
          author_avatar: payload.authorAvatar,
          raw_text: payload.rawText,
          full_content: payload.fullContent,
          content_type: payload.contentType,
          has_video: payload.hasVideo,
          video_duration_seconds: payload.videoDurationSeconds,
          article_url: payload.articleUrl,
          article_content: payload.articleContent,
        })
        .eq('id', existing.id);

      // Generate summary
      await processSummary(existing.id, payload, supabase);

      return NextResponse.json({
        success: true,
        tweetId: existing.id,
        message: 'Tweet updated',
      });
    }

    // Create new record
    const { data: tweet, error: insertError } = await supabase
      .from('tweets')
      .insert({
        user_id: payload.userId,
        tweet_id: payload.tweetId,
        tweet_url: payload.tweetUrl,
        author_name: payload.authorName,
        author_handle: payload.authorHandle,
        author_avatar: payload.authorAvatar,
        raw_text: payload.rawText,
        full_content: payload.fullContent,
        content_type: payload.contentType,
        has_video: payload.hasVideo,
        video_duration_seconds: payload.videoDurationSeconds,
        article_url: payload.articleUrl,
        article_content: payload.articleContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save tweet' },
        { status: 500 }
      );
    }

    // Generate summary
    await processSummary(tweet.id, payload, supabase);

    return NextResponse.json({
      success: true,
      tweetId: tweet.id,
      message: 'Tweet captured',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processSummary(
  tweetDbId: string,
  payload: WebhookPayload,
  supabase: ReturnType<typeof getServiceClient>
) {
  try {
    const contentToSummarize = [
      payload.fullContent,
      payload.articleContent ? `\n\nArticle: ${payload.articleContent}` : '',
    ].join('');

    if (!contentToSummarize.trim()) {
      return;
    }

    const summary = await summarizeTweet(contentToSummarize, payload.contentType);

    // Get category ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', summary.suggestedCategory)
      .single();

    await supabase
      .from('tweets')
      .update({
        summary,
        category_id: category?.id,
      })
      .eq('id', tweetDbId);
  } catch (error) {
    console.error('Summary processing error:', error);
  }
}
