// Content types for tweets
export type ContentType = 'single' | 'thread' | 'video' | 'article';

// Categories
export type CategorySlug = 'vibe-coding-tutorials' | 'learning' | 'inspiration' | 'untagged';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  isSystem: boolean;
}

// AI Summary structure
export interface TweetSummary {
  tldr: string;
  keyPoints: string[];
  whyItMatters: string;
  suggestedCategory: CategorySlug;
}

// Main tweet/bookmark entity
export interface Tweet {
  id: string;
  userId: string;
  tweetId: string;
  tweetUrl: string;
  authorHandle: string;
  authorName: string;
  authorAvatar?: string;
  contentType: ContentType;
  rawText: string;
  fullContent: string;
  hasVideo: boolean;
  videoTranscript?: string;
  videoDurationSeconds?: number;
  articleUrl?: string;
  articleContent?: string;
  summary?: TweetSummary;
  categoryId?: string;
  category?: Category;
  capturedAt: string;
  isRead: boolean;
  isStarred: boolean;
}

// API request/response types
export interface CaptureRequest {
  url: string;
  sharedText?: string;
}

export interface CaptureResponse {
  success: boolean;
  tweetId?: string;
  message?: string;
  error?: string;
}

export interface DigestResponse {
  tweets: Tweet[];
  totalCount: number;
  unreadCount: number;
}

// Processing status for real-time feedback
export type ProcessingStep =
  | 'extracting'
  | 'fetching-article'
  | 'transcribing'
  | 'summarizing'
  | 'categorizing'
  | 'complete'
  | 'error';

export interface ProcessingStatus {
  tweetId: string;
  step: ProcessingStep;
  progress: number;
  message: string;
}

// Chrome extension message types
export interface ExtensionMessage {
  type: 'CAPTURE_TWEET' | 'GET_AUTH_STATUS' | 'LOGIN' | 'LOGOUT';
  payload?: unknown;
}

export interface ExtensionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// User preferences
export interface UserPreferences {
  darkMode: 'system' | 'light' | 'dark';
  digestTime: string; // HH:mm format
  notificationsEnabled: boolean;
}

// Database row types (snake_case for Supabase)
export interface TweetRow {
  id: string;
  user_id: string;
  tweet_id: string;
  tweet_url: string;
  author_handle: string;
  author_name: string;
  author_avatar?: string;
  content_type: ContentType;
  raw_text: string;
  full_content: string;
  has_video: boolean;
  video_transcript?: string;
  video_duration_seconds?: number;
  article_url?: string;
  article_content?: string;
  summary?: TweetSummary;
  category_id?: string;
  captured_at: string;
  is_read: boolean;
  is_starred: boolean;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
}

// Utility type for converting between camelCase and snake_case
export type CamelToSnake<T> = T extends object
  ? { [K in keyof T as CamelToSnakeCase<K & string>]: CamelToSnake<T[K]> }
  : T;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;
