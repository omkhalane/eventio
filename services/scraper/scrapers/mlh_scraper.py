"""Scraper for MLH events (https://www.mlh.com/seasons/2026/events)."""
from bs4 import BeautifulSoup
import re
from datetime import datetime
import html as html_module
import json

from .template_scraper import fetch_static, fetch_rendered, normalize_event


MONTHS = {
    'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
    'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12,
}


def _iso(year: int, month_abbr: str, day: int):
    m = MONTHS.get(month_abbr.upper())
    if not m:
        return None
    try:
        return datetime(year, m, day).strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        return None


def _extract_upcoming_events(html: str):
    """Extract the embedded `upcomingEvents` JSON array from the MLH page."""
    source = html_module.unescape(html)
    key = '"upcomingEvents":['
    start = source.find(key)
    if start == -1:
        return []

    index = start + len(key)
    depth = 1
    in_string = False
    escaped = False
    while index < len(source):
        char = source[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                in_string = False
        else:
            if char == '"':
                in_string = True
            elif char == '[':
                depth += 1
            elif char == ']':
                depth -= 1
                if depth == 0:
                    break
        index += 1

    array_text = '[' + source[start + len(key):index] + ']'
    try:
        return json.loads(array_text)
    except Exception:
        return []


def _normalize_status(status: str) -> str:
    status = (status or '').lower()
    if status in {'in_progress', 'ongoing', 'live'}:
        return 'ongoing'
    if status in {'ended', 'past', 'closed'}:
        return 'past'
    return 'upcoming'


def parse_events_from_html(html: str):
    items = _extract_upcoming_events(html)
    events = []

    for item in items:
        title = item.get('name') or item.get('title')
        slug = item.get('slug')
        if not title or not slug:
            continue

        start_time = item.get('startsAt')
        end_time = item.get('endsAt')
        url = item.get('websiteUrl')
        if not url or not str(url).startswith('http'):
            url = f'https://events.mlh.io/events/{slug}'

        events.append({
            'title': title,
            'platform': 'mlh',
            'external_id': slug,
            'start_time': start_time,
            'end_time': end_time,
            'status': _normalize_status(item.get('status')),
            'url': url,
            'extra': {
                'mlh_url': item.get('url'),
                'website_url': item.get('websiteUrl'),
                'location': item.get('location'),
                'region': item.get('region'),
                'format_type': item.get('formatType'),
                'venue_address': item.get('venueAddress'),
                'date_range': item.get('dateRange'),
                'raw_slug': slug,
            },
        })

    dedup = {}
    for event in events:
        dedup[event['external_id']] = event
    return list(dedup.values())


def fetch_mlh():
    url = 'https://www.mlh.com/seasons/2026/events'
    events = []
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        events = []
    if not events:
        html = fetch_rendered(url)
        events = parse_events_from_html(html)
    return [normalize_event(e) for e in events]


if __name__ == '__main__':
    ev = fetch_mlh()
    print(len(ev))
