import { CalendarEvent } from '../types';

let googleAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  googleAccessToken = token;
};

export const isGoogleAuthorized = () => !!googleAccessToken;

export const syncEventToGoogle = async (event: CalendarEvent) => {
  if (!googleAccessToken) {
    throw new Error('Google Calendar access not authorized. Please sign in with Google again.');
  }

  const extraDetails = Object.entries(event.extra || {})
    .filter(([key]) => !['description', 'title'].includes(key))
    .map(
      ([key, value]) =>
        `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
    )
    .join('\n');

  const googleEvent = {
    summary: event.title,
    description:
      (event.extra?.description || event.title) +
      (extraDetails ? `\n\nDetails:\n${extraDetails}` : '') +
      (event.url ? `\n\nLink: ${event.url}` : ''),
    location:
      event.city || event.country
        ? `${event.city || ''} ${event.country || ''}`.trim()
        : event.is_online
          ? 'Online'
          : '',
    start: {
      dateTime: new Date(event.start_time).toISOString(),
      timeZone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.end_time
        ? new Date(event.end_time).toISOString()
        : new Date(new Date(event.start_time).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401) {
        googleAccessToken = null;
        throw new Error('Session expired. Please sign in again.');
      }
      // If the error body contains information about the API being disabled
      if (errorBody.includes('SERVICE_DISABLED') || errorBody.includes('accessNotConfigured')) {
        throw new Error(
          'Google Calendar API is not enabled for this project. Please click the link below to enable it.',
        );
      }
      throw new Error(`Failed to sync to Google Calendar: ${errorBody}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw new Error(
        'Network error: Unable to reach Google Calendar API. This can happen if you are offline or if a browser extension is blocking the request.',
      );
    }
    throw err;
  }
};

export const syncAllEventsToGoogle = async (events: CalendarEvent[]) => {
  if (!googleAccessToken) {
    throw new Error('Google Calendar access not authorized.');
  }

  const results = [];
  for (const event of events) {
    try {
      const res = await syncEventToGoogle(event);
      results.push(res);
    } catch (err) {
      console.error(`Failed to sync event ${event.id}:`, err);
    }
  }
  return results;
};
