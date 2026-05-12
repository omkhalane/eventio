import crypto from 'crypto';

export interface CanonicalEventLike {
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime?: Date | string | null;
  canonicalUrl: string;
  platformId: string;
  organizer?: string | null;
}

export const normalizeEventText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(inc|ltd|llc|co|company|the|and|of|for|with|by)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const textSimilarity = (left: string, right: string) => {
  const leftTokens = new Set(normalizeEventText(left).split(' ').filter(Boolean));
  const rightTokens = new Set(normalizeEventText(right).split(' ').filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const sameDay = (left: Date | string, right: Date | string) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return leftDate.toISOString().slice(0, 10) === rightDate.toISOString().slice(0, 10);
};

export const buildDedupeHash = (event: CanonicalEventLike) => {
  const title = normalizeEventText(event.title);
  const organizer = event.organizer ? normalizeEventText(event.organizer) : '';
  const startDate = new Date(event.startTime).toISOString().slice(0, 10);
  const endDate = event.endTime ? new Date(event.endTime).toISOString().slice(0, 10) : '';
  const canonicalHost = (() => {
    try {
      return new URL(event.canonicalUrl).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();

  return crypto
    .createHash('sha256')
    .update([event.platformId, title, organizer, startDate, endDate, canonicalHost].join('|'))
    .digest('hex');
};

export const isLikelyDuplicate = (
  candidate: CanonicalEventLike,
  existing: Array<{
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime?: Date | string | null;
    canonicalUrl: string;
    platformId?: string | null;
  }>,
) => {
  const candidateTitle = candidate.title;
  const candidateOrganizer = candidate.organizer || '';
  const candidateDate = new Date(candidate.startTime);

  return existing.some((entry) => {
    const existingTitle = entry.title;
    const existingOrganizer = entry.description || '';
    const existingDate = new Date(entry.startTime);
    const sameWindow =
      Math.abs(candidateDate.getTime() - existingDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    const titleScore = textSimilarity(candidateTitle, existingTitle);
    const organizerScore =
      candidateOrganizer && existingOrganizer
        ? textSimilarity(candidateOrganizer, existingOrganizer)
        : 0;
    const sameHost = (() => {
      try {
        return (
          new URL(candidate.canonicalUrl).hostname.replace(/^www\./, '') ===
          new URL(entry.canonicalUrl).hostname.replace(/^www\./, '')
        );
      } catch {
        return false;
      }
    })();

    return sameHost || (sameWindow && (titleScore >= 0.7 || organizerScore >= 0.8));
  });
};
