import Anthropic from '@anthropic-ai/sdk';
import type { TweetSummary, ContentType, CategorySlug } from '@sunto/shared';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant that summarizes Twitter/X content. Your task is to create concise, valuable summaries that help users quickly understand and remember saved tweets.

Output a JSON object with exactly these fields:
- tldr: A single sentence summary, max 100 characters
- keyPoints: Array of 2-4 key takeaways (each max 150 characters)
- whyItMatters: One sentence explaining the relevance or value
- suggestedCategory: One of "vibe-coding-tutorials", "learning", "inspiration", or "untagged"

Category guidelines:
- "vibe-coding-tutorials": Coding content, tech tutorials, programming tips, AI/ML content, developer tools
- "learning": Educational content, knowledge sharing, how-tos, explanations, research
- "inspiration": Motivational content, interesting ideas, creative work, thought-provoking threads
- "untagged": When unsure or content doesn't fit other categories

Be concise and focus on actionable insights. Avoid filler words.`;

export async function summarizeTweet(
  content: string,
  contentType: ContentType
): Promise<TweetSummary> {
  const contentTypeContext = {
    single: 'a single tweet',
    thread: 'a Twitter thread',
    video: 'a video tweet with transcript',
    article: 'a tweet with an article link',
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Summarize this ${contentTypeContext[contentType]}:\n\n${content}`,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the response
    const summary: TweetSummary = {
      tldr: String(parsed.tldr || '').slice(0, 100),
      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.map((p: unknown) => String(p).slice(0, 150)).slice(0, 4)
        : [],
      whyItMatters: String(parsed.whyItMatters || ''),
      suggestedCategory: validateCategory(parsed.suggestedCategory),
    };

    return summary;
  } catch (error) {
    console.error('Summarization error:', error);

    // Return a fallback summary
    return {
      tldr: 'Summary unavailable',
      keyPoints: ['Content captured but summarization failed'],
      whyItMatters: 'Review the original content for details',
      suggestedCategory: 'untagged',
    };
  }
}

function validateCategory(category: unknown): CategorySlug {
  const validCategories: CategorySlug[] = [
    'vibe-coding-tutorials',
    'learning',
    'inspiration',
    'untagged',
  ];

  if (typeof category === 'string' && validCategories.includes(category as CategorySlug)) {
    return category as CategorySlug;
  }

  return 'untagged';
}
