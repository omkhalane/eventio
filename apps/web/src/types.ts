export type EventCategory =
  | 'competitive_programming'
  | 'global_competition'
  | 'hackathon'
  | 'hiring_challenge'
  | 'data_science'
  | 'community_event'
  | 'conference'
  | 'cybersecurity_ctf'
  | 'open_source'
  | 'live_stream';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  platform: string;
  external_id: string;
  start_time: string;
  end_time?: string;
  timezone: string;
  event_type: string;
  tags: string[];
  is_online: boolean;
  city?: string;
  country?: string;
  url: string;
  is_free: boolean;
  price?: number;
  currency?: string;
  status: EventStatus;
  extra: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  google_id: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'month' | 'week' | 'day' | 'list';

export interface FilterState {
  categories: EventCategory[];
  platforms: string[];
  mode: 'online' | 'offline' | 'hybrid' | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}
