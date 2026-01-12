import { createClient } from '@supabase/supabase-js';
import { summarizeTweet } from '@/lib/ai/summarize';
import { transcribeVideo } from '@/lib/ai/transcribe';
import type { Database } from '@sunto/db';
import type { ContentType } from '@sunto/shared';

// Service client for background processing
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

interface ExtractedTweetData {
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
}

export async function processTweet(tweetId: string, tweetUrl: string): Promise<void> {
  const supabase = getServiceClient();

  try {
    // Step 1: Extract tweet content
    // In production, this would use the Chrome extension's extraction
    // or a server-side scraping solution
    const extracted = await extractTweetContent(tweetUrl);

    // Update with extracted content
    await supabase
      .from('tweets')
      .update({
        author_name: extracted.authorName,
        author_handle: extracted.authorHandle,
        author_avatar: extracted.authorAvatar,
        raw_text: extracted.rawText,
        full_content: extracted.fullContent,
        content_type: extracted.contentType,
        has_video: extracted.hasVideo,
        article_url: extracted.articleUrl,
      })
      .eq('id', tweetId);

    let transcriptText = '';

    // Step 2: Transcribe video if present
    if (extracted.hasVideo && extracted.videoUrl) {
      try {
        const transcript = await transcribeVideo(extracted.videoUrl);
        transcriptText = transcript;

        await supabase
          .from('tweets')
          .update({
            video_transcript: transcript,
            video_duration_seconds: extracted.videoDurationSeconds,
          })
          .eq('id', tweetId);
      } catch (error) {
        console.error('Transcription error:', error);
      }
    }

    // Step 3: Summarize with AI
    const contentToSummarize = [
      extracted.fullContent,
      transcriptText ? `\n\nVideo Transcript: ${transcriptText}` : '',
    ].join('');

    if (contentToSummarize.trim()) {
      const summary = await summarizeTweet(contentToSummarize, extracted.contentType);

      // Get category ID based on suggested category
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
        .eq('id', tweetId);
    }
  } catch (error) {
    console.error('Processing pipeline error:', error);
    throw error;
  }
}

// Placeholder for tweet extraction
// In production, this would integrate with the Chrome extension
// or use a server-side solution
async function extractTweetContent(tweetUrl: string): Promise<ExtractedTweetData> {
  // This is a placeholder - real extraction would come from:
  // 1. Chrome extension sending extracted data via webhook
  // 2. Server-side scraping with Puppeteer/Playwright
  // 3. Twitter API (if available)

  // For now, return placeholder data
  // The extension will update this via the webhook endpoint
  return {
    authorName: 'Unknown',
    authorHandle: 'unknown',
    rawText: 'Content pending extraction...',
    fullContent: 'Content pending extraction...',
    contentType: 'single',
    hasVideo: false,
  };
}
