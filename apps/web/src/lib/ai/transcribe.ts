import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeVideo(videoUrl: string): Promise<string> {
  try {
    // Step 1: Download video and extract audio
    // In production, this would:
    // 1. Download the video from Twitter/X CDN
    // 2. Extract audio using ffmpeg
    // 3. Convert to a format Whisper accepts (mp3, wav, etc.)

    // For now, if we have a direct audio URL, use it
    const audioFile = await downloadAudio(videoUrl);

    if (!audioFile) {
      throw new Error('Could not extract audio from video');
    }

    // Step 2: Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Try to get YouTube transcript first (free)
export async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    // YouTube Transcript API endpoint
    // In production, use a proper YouTube transcript library
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`
    );

    if (!response.ok) {
      return null;
    }

    const xml = await response.text();
    // Parse XML and extract text
    const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g);
    if (!textMatches) {
      return null;
    }

    const transcript = textMatches
      .map((match) => {
        const text = match.replace(/<[^>]+>/g, '');
        return decodeHTMLEntities(text);
      })
      .join(' ');

    return transcript;
  } catch (error) {
    console.error('YouTube transcript error:', error);
    return null;
  }
}

// Helper to download and prepare audio for transcription
async function downloadAudio(videoUrl: string): Promise<File | null> {
  try {
    // This is a placeholder
    // In production, you would:
    // 1. Use yt-dlp or similar to download video
    // 2. Use ffmpeg to extract audio
    // 3. Return the audio file

    // For Twitter videos, the URL structure is different
    // You might need to use the extension to capture video URLs
    // or implement server-side video processing

    console.log('Would download audio from:', videoUrl);
    return null;
  } catch (error) {
    console.error('Audio download error:', error);
    return null;
  }
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
}
