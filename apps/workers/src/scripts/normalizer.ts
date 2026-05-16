import { NormalizedEvent } from '@eventio/scraper-core/src/schema';

export function normalizeEvent(raw: any, platform: string, sourceUrl: string): NormalizedEvent {
  const base: NormalizedEvent = {
    title: '',
    platform,
    sourceUrl: sourceUrl || 'https://example.com',
    rawData: raw,
  };

  try {
    if (platform === 'codeforces') {
      base.title = raw.name;
      base.platformEventId = raw.id?.toString();
      base.description = `Codeforces Contest ${raw.id}`;
      base.startDate = raw.startTimeSeconds ? new Date(raw.startTimeSeconds * 1000).toISOString() : undefined;
      base.endDate = (raw.startTimeSeconds && raw.durationSeconds) 
        ? new Date((raw.startTimeSeconds + raw.durationSeconds) * 1000).toISOString() 
        : undefined;
      base.category = 'Competitive Programming';
      base.mode = 'online';
      base.isFree = true;
      base.sourceUrl = sourceUrl || `https://codeforces.com/contests/${raw.id}`;
    } else if (platform === 'leetcode') {
      base.title = raw.title;
      base.platformEventId = raw.titleSlug;
      base.description = `LeetCode Contest ${raw.title}`;
      base.startDate = raw.startTime ? new Date(raw.startTime * 1000).toISOString() : undefined;
      base.endDate = (raw.startTime && raw.duration) 
        ? new Date((raw.startTime + raw.duration) * 1000).toISOString() 
        : undefined;
      base.category = 'Competitive Programming';
      base.mode = 'online';
      base.isFree = true;
      base.sourceUrl = sourceUrl || `https://leetcode.com/contest/${raw.titleSlug}`;
    } else if (platform === 'hackerrank') {
      base.title = raw.title || 'HackerRank Challenge';
      base.category = 'Competitive Programming';
      base.mode = 'online';
      base.isFree = true;
      base.sourceUrl = sourceUrl || 'https://www.hackerrank.com/challenges';
    } else if (platform === 'unstop' || platform === 'devpost' || platform === 'devfolio') {
      base.title = raw.title || platform;
      base.platformEventId = raw.id?.toString() || raw.slug || raw.uuid;
      base.description = raw.description || raw.detailText || raw.listingText;
      base.shortDescription = raw.shortDescription;
      base.startDate = raw.startTime ? new Date(raw.startTime).toISOString() : undefined;
      base.endDate = raw.endTime ? new Date(raw.endTime).toISOString() : undefined;
      base.registrationDeadline = raw.registrationDeadline ? new Date(raw.registrationDeadline).toISOString() : undefined;
      base.bannerImage = raw.bannerImage || raw.logoUrl;
      base.category = platform === 'unstop' ? 'Hackathon' : 'Hackathon';
      base.tags = raw.tags;
      base.organizerName = raw.organizerName || raw.host;
      base.isFree = raw.isFree ?? true;
      base.mode = raw.mode;
      base.location = raw.location;
    } else {
      // atcoder, codechef, geeksforgeeks, mlh
      base.title = raw.title || platform;
      base.platformEventId = raw.id?.toString() || raw.contestCode;
      base.description = raw.description || raw.listingText || raw.pageText;
      base.startDate = raw.startTime ? new Date(raw.startTime).toISOString() : undefined;
      base.endDate = raw.endTime ? new Date(raw.endTime).toISOString() : undefined;
      base.category = 'Tech Event';
      base.tags = raw.tags;
      if (!base.sourceUrl || base.sourceUrl === 'https://example.com') {
        base.sourceUrl = raw.url || raw.canonicalUrl || `https://example.com/events/${platform}/${raw.id}`;
      }
    }
  } catch (e) {
    console.error(`Error normalizing ${platform} event:`, e);
  }

  // Fallbacks
  if (!base.title) base.title = `${platform} Event`;
  
  return base;
}
