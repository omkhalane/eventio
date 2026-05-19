import { CalendarEvent } from '../types';

const STORAGE_KEY = 'eventio-last-opened-event';

type LastOpenedEvent = {
  event: CalendarEvent;
  source: 'calendar' | 'modal';
  openedAt: string;
};

export function getLastOpenedEvent(): LastOpenedEvent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LastOpenedEvent;
    if (!parsed?.event?.slug) return null;

    return parsed;
  } catch (error) {
    console.warn('Unable to restore recent event:', error);
    return null;
  }
}

export function setLastOpenedEvent(event: CalendarEvent, source: LastOpenedEvent['source']) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        event,
        source,
        openedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn('Unable to save recent event:', error);
  }
}

export function clearLastOpenedEvent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear recent event:', error);
  }
}
