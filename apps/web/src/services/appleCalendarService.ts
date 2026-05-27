import { CalendarEvent } from '../types';

/**
 * Format a Date object to the ICS format: YYYYMMDDTHHMMSSZ
 */
const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Fold lines longer than 75 characters as required by RFC 5545
 */
const foldLine = (line: string): string => {
  const parts = [];
  let current = line;
  while (current.length > 75) {
    parts.push(current.substring(0, 75));
    current = ' ' + current.substring(75);
  }
  parts.push(current);
  return parts.join('\r\n');
};

/**
 * Generate an ICS file content string for a given event.
 */
export const generateIcsForEvent = (event: CalendarEvent): string => {
  const startDate = new Date(event.start_time);
  const endDate = event.end_time
    ? new Date(event.end_time)
    : new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour if no end time

  const extraDetails = Object.entries(event.extra || {})
    .filter(([key]) => !['description', 'title'].includes(key))
    .map(
      ([key, value]) =>
        `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
    )
    .join('\\n');

  let description = event.extra?.description || event.title;
  if (extraDetails) description += `\\n\\nDetails:\\n${extraDetails}`;
  if (event.url) description += `\\n\\nLink: ${event.url}`;

  // Escape special characters for ICS
  description = description.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const summary = event.title.replace(/,/g, '\\,').replace(/;/g, '\\;');
  const location =
    event.city || event.country
      ? `${event.city || ''} ${event.country || ''}`.trim()
      : event.is_online
        ? 'Online'
        : '';
  const escapedLocation = location.replace(/,/g, '\\,').replace(/;/g, '\\;');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventio//Calendar Sync//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@eventio.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
  ];

  if (escapedLocation) {
    lines.push(`LOCATION:${escapedLocation}`);
  }
  
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
};

/**
 * Trigger a download of the ICS file in the browser.
 */
export const downloadIcsFile = (event: CalendarEvent) => {
  const icsContent = generateIcsForEvent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Create a safe filename
  const filename = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event';
  a.download = `${filename}.ics`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
