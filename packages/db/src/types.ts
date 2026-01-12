export interface Database {
  public: {
    Tables: {
      tweets: {
        Row: {
          id: string;
          user_id: string;
          tweet_id: string;
          tweet_url: string;
          author_handle: string | null;
          author_name: string | null;
          author_avatar: string | null;
          content_type: 'single' | 'thread' | 'video' | 'article' | null;
          raw_text: string | null;
          full_content: string | null;
          has_video: boolean;
          video_transcript: string | null;
          video_duration_seconds: number | null;
          article_url: string | null;
          article_content: string | null;
          summary: {
            tldr: string;
            keyPoints: string[];
            whyItMatters: string;
            suggestedCategory: string;
          } | null;
          category_id: string | null;
          captured_at: string;
          is_read: boolean;
          is_starred: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tweet_id: string;
          tweet_url: string;
          author_handle?: string | null;
          author_name?: string | null;
          author_avatar?: string | null;
          content_type?: 'single' | 'thread' | 'video' | 'article' | null;
          raw_text?: string | null;
          full_content?: string | null;
          has_video?: boolean;
          video_transcript?: string | null;
          video_duration_seconds?: number | null;
          article_url?: string | null;
          article_content?: string | null;
          summary?: {
            tldr: string;
            keyPoints: string[];
            whyItMatters: string;
            suggestedCategory: string;
          } | null;
          category_id?: string | null;
          captured_at?: string;
          is_read?: boolean;
          is_starred?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          tweet_id?: string;
          tweet_url?: string;
          author_handle?: string | null;
          author_name?: string | null;
          author_avatar?: string | null;
          content_type?: 'single' | 'thread' | 'video' | 'article' | null;
          raw_text?: string | null;
          full_content?: string | null;
          has_video?: boolean;
          video_transcript?: string | null;
          video_duration_seconds?: number | null;
          article_url?: string | null;
          article_content?: string | null;
          summary?: {
            tldr: string;
            keyPoints: string[];
            whyItMatters: string;
            suggestedCategory: string;
          } | null;
          category_id?: string | null;
          is_read?: boolean;
          is_starred?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_system?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          is_system?: boolean;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          dark_mode: 'system' | 'light' | 'dark';
          digest_time: string;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dark_mode?: 'system' | 'light' | 'dark';
          digest_time?: string;
          notifications_enabled?: boolean;
        };
        Update: {
          dark_mode?: 'system' | 'light' | 'dark';
          digest_time?: string;
          notifications_enabled?: boolean;
        };
      };
    };
  };
}
