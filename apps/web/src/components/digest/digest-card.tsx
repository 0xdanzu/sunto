'use client';

import { useState } from 'react';
import {
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { formatRelativeTime } from '@sunto/shared';
import type { Tweet } from '@sunto/shared';

interface DigestCardProps {
  tweet: Tweet;
  onMarkRead: (id: string) => void;
  onToggleStar: (id: string) => void;
}

const contentTypeIcons = {
  single: MessageSquare,
  thread: MessageSquare,
  video: Video,
  article: FileText,
};

export function DigestCard({ tweet, onMarkRead, onToggleStar }: DigestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const ContentIcon = contentTypeIcons[tweet.contentType];

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!tweet.isRead) {
      onMarkRead(tweet.id);
    }
  };

  return (
    <article
      className={`bg-card rounded-xl border border-border p-4 transition-all ${
        !tweet.isRead ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            {tweet.authorAvatar ? (
              <img
                src={tweet.authorAvatar}
                alt={tweet.authorName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium">
                {tweet.authorName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{tweet.authorName}</p>
            <p className="text-sm text-muted-foreground truncate">
              @{tweet.authorHandle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(tweet.capturedAt)}
          </span>
          <button
            onClick={() => onToggleStar(tweet.id)}
            className={`p-1 rounded-full transition-colors ${
              tweet.isStarred
                ? 'text-yellow-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={tweet.isStarred ? 'Unstar' : 'Star'}
          >
            <Star className="w-4 h-4" fill={tweet.isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content type badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
          <ContentIcon className="w-3 h-3" />
          {tweet.contentType === 'thread' ? 'Thread' : tweet.contentType}
        </span>
        {tweet.category && (
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {tweet.category.name}
          </span>
        )}
      </div>

      {/* Summary */}
      {tweet.summary && (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{tweet.summary.tldr}</p>

          <ul className="space-y-1">
            {tweet.summary.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                {point}
              </li>
            ))}
          </ul>

          {tweet.summary.whyItMatters && (
            <p className="text-sm text-muted-foreground italic">
              {tweet.summary.whyItMatters}
            </p>
          )}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {tweet.fullContent && (
            <div className="text-sm whitespace-pre-wrap">{tweet.fullContent}</div>
          )}

          {tweet.videoTranscript && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Video className="w-3 h-3" /> Video Transcript
              </p>
              <p className="text-sm whitespace-pre-wrap">{tweet.videoTranscript}</p>
            </div>
          )}

          {tweet.articleContent && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Article Content
              </p>
              <p className="text-sm whitespace-pre-wrap">{tweet.articleContent}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <button
          onClick={handleExpand}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> More
            </>
          )}
        </button>

        <a
          href={tweet.tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" /> Original
        </a>
      </div>
    </article>
  );
}
