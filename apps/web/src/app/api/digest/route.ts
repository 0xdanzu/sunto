import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const starred = searchParams.get('starred') === 'true';
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('tweets')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (starred) {
      query = query.eq('is_starred', true);
    }

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: tweets, error, count } = await query;

    if (error) {
      console.error('Digest query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch digest' },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('tweets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      tweets: tweets || [],
      totalCount: count || 0,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Digest error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark tweets as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tweetIds, isRead, isStarred } = body;

    if (!tweetIds || !Array.isArray(tweetIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tweet IDs' },
        { status: 400 }
      );
    }

    const updates: Record<string, boolean> = {};
    if (typeof isRead === 'boolean') updates.is_read = isRead;
    if (typeof isStarred === 'boolean') updates.is_starred = isStarred;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tweets')
      .update(updates)
      .eq('user_id', user.id)
      .in('id', tweetIds);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update tweets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Digest update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
