export type ScraperPlatform =
  | 'codeforces'
  | 'leetcode'
  | 'hackerrank'
  | 'unstop'
  | 'devpost'
  | 'atcoder'
  | 'codechef'
  | 'geeksforgeeks'
  | 'mlh';

export interface ScrapedEventRecord {
  sourcePlatformId: ScraperPlatform;
  sourceUrl: string;
  rawPayload: Record<string, unknown>;
}

export interface ParsedDateRange {
  startTime: Date;
  endTime: Date;
}
