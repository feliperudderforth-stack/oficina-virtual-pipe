import { Platform, SourceFetchResult } from '@/types/social-listening';
import { fetchTwitterMentions } from './twitter';
import { fetchInstagramMentions } from './instagram';
import { fetchTikTokMentions } from './tiktok';
import { fetchYouTubeMentions } from './youtube';
import { fetchNewsMentions } from './news';

const SOURCE_MAP: Record<Platform, (keywords: string[]) => Promise<SourceFetchResult>> = {
  twitter: fetchTwitterMentions,
  instagram: fetchInstagramMentions,
  tiktok: fetchTikTokMentions,
  youtube: fetchYouTubeMentions,
  news: fetchNewsMentions,
  blogs: fetchNewsMentions,
};

export async function fetchAllSources(
  platforms: Platform[],
  keywords: string[]
): Promise<SourceFetchResult[]> {
  const fetchers = platforms.map(platform => {
    const fetcher = SOURCE_MAP[platform];
    if (!fetcher) {
      return Promise.resolve({
        platform,
        mentions: [],
        fetchedAt: new Date().toISOString(),
        success: false,
        error: `No connector available for platform: ${platform}`,
      } as SourceFetchResult);
    }
    return fetcher(keywords);
  });

  return Promise.all(fetchers);
}

export { fetchTwitterMentions } from './twitter';
export { fetchInstagramMentions } from './instagram';
export { fetchTikTokMentions } from './tiktok';
export { fetchYouTubeMentions } from './youtube';
export { fetchNewsMentions } from './news';
