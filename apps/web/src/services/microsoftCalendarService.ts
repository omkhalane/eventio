import { CalendarEvent } from '../types';

let microsoftAccessToken: string | null = null;

export const setMicrosoftAccessToken = (token: string | null) => {
  microsoftAccessToken = token;
};

export const isMicrosoftAuthorized = () => !!microsoftAccessToken;

export const syncEventToMicrosoft = async (event: CalendarEvent) => {
  if (!microsoftAccessToken) {
    throw new Error('Microsoft Calendar access not authorized. Please sign in with Microsoft again.');
  }

  const extraDetails = Object.entries(event.extra || {})
    .filter(([key]) => !['description', 'title'].includes(key))
    .map(
      ([key, value]) =>
        `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
    )
    .join('\n');

  const microsoftEvent = {
    subject: event.title,
    body: {
      contentType: 'HTML',
      content:
        (event.extra?.description || event.title).replace(/\n/g, '<br/>') +
        (extraDetails ? `<br/><br/>Details:<br/>${extraDetails.replace(/\n/g, '<br/>')}` : '') +
        (event.url ? `<br/><br/><a href="${event.url}">Event Link</a>` : ''),
    },
    location: {
      displayName:
        event.city || event.country
          ? `${event.city || ''} ${event.country || ''}`.trim()
          : event.is_online
            ? 'Online'
            : '',
    },
    start: {
      dateTime: new Date(event.start_time).toISOString(),
      timeZone: 'UTC', // Graph API handles UTC seamlessly when timeZone is specified as UTC
    },
    end: {
      dateTime: event.end_time
        ? new Date(event.end_time).toISOString()
        : new Date(new Date(event.start_time).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC',
    },
  };

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${microsoftAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(microsoftEvent),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401) {
        microsoftAccessToken = null;
        throw new Error('Session expired. Please sign in again.');
      }
      throw new Error(`Failed to sync to Microsoft Calendar: ${errorBody}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw new Error(
        'Network error: Unable to reach Microsoft Calendar API. This can happen if you are offline or if a browser extension is blocking the request.',
      );
    }
    throw err;
  }
};

export const syncAllEventsToMicrosoft = async (events: CalendarEvent[]) => {
  if (!microsoftAccessToken) {
    throw new Error('Microsoft Calendar access not authorized.');
  }

  const results = [];
  for (const event of events) {
    try {
      const res = await syncEventToMicrosoft(event);
      results.push(res);
    } catch (err) {
      console.error(`Failed to sync event ${event.id}:`, err);
    }
  }
  return results;
};
