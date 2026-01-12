import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parseTweetUrl, isValidTweetUrl } from '@sunto/shared';
import { processTweet } from '@/lib/processing/pipeline';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || !isValidTweetUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tweet URL' },
        { status: 400 }
      );
    }

    const parsed = parseTweetUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Could not parse tweet URL' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('tweets')
      .select('id')
      .eq('user_id', user.id)
      .eq('tweet_id', parsed.tweetId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        tweetId: existing.id,
        message: 'Tweet already captured',
      });
    }

    // Create initial record
    const { data: tweet, error: insertError } = await supabase
      .from('tweets')
      .insert({
        user_id: user.id,
        tweet_id: parsed.tweetId,
        tweet_url: url,
        author_handle: parsed.username,
        content_type: 'single',
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

    // Process tweet in background (summarization, etc.)
    // In production, this would be a queue/background job
    processTweet(tweet.id, url).catch(console.error);

    return NextResponse.json({
      success: true,
      tweetId: tweet.id,
      message: 'Tweet captured and processing',
    });
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
