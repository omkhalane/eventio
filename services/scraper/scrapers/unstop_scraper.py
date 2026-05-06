"""Scraper for Unstop (hackathons, workshops, conferences).

Supports pages filtered by oppstatus=open.
"""
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta, timezone

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def _parse_posted_date(line: str):
    m = re.search(r'Posted\s+([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})', line)
    if not m:
        return None
    try:
        dt = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%b %d %Y")
        dt = dt.replace(tzinfo=timezone.utc)
        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        return None


def _estimate_end_from_left(line: str):
    now = datetime.now(timezone.utc)
    dm = re.search(r'(\d+)\s+days?\s+left', line)
    hm = re.search(r'(\d+)\s+hours?\s+left', line)
    mm = re.search(r'(\d+)\s+minutes?\s+left', line)
    if dm:
        return (now + timedelta(days=int(dm.group(1)))).strftime('%Y-%m-%dT%H:%M:%SZ')
    if hm:
        return (now + timedelta(hours=int(hm.group(1)))).strftime('%Y-%m-%dT%H:%M:%SZ')
    if mm:
        return (now + timedelta(minutes=int(mm.group(1)))).strftime('%Y-%m-%dT%H:%M:%SZ')
    return None


def _is_title_candidate(line: str):
    if not line or len(line) < 4 or len(line) > 140:
        return False
    low = line.lower()
    banned = (
        'filters', 'team size', 'payment', 'categories', 'sort by', 'online',
        'members', 'everyone can apply', 'posted ', 'days left', 'hours left',
        'minutes left', 'featured', 'applied', 'registered', 'fee'
    )
    if any(b in low for b in banned):
        return False
    # avoid numeric-only or tiny fragments
    if re.fullmatch(r'[\d\W_]+', line):
        return False
    # prefer lines with words, often title-cased
    return any(ch.isalpha() for ch in line)


def parse_events_from_html(html: str, platform: str = 'unstop'):
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text('\n')
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    events = []

    # scan card-like sequences on listing pages
    for i, line in enumerate(lines):
        if i < 35:
            continue
        if not _is_title_candidate(line):
            continue

        # Card boundary heuristic: title is usually right after previous card's
        # "X days/hours/minutes left" line (or near sort header for first card).
        prev_line = lines[i - 1] if i - 1 >= 0 else ''
        if not (
            re.search(r'\d+\s+(days?|hours?|minutes?)\s+left', prev_line) or
            prev_line.lower() in {'sort by', 'filters', 'categories', 'payment'}
        ):
            continue

        # within next 12 lines, card usually has 'Posted ...'
        posted_idx = None
        for j in range(i, min(i + 13, len(lines))):
            if lines[j].startswith('Posted '):
                posted_idx = j
                break
        if posted_idx is None:
            continue

        title = line
        posted_line = lines[posted_idx]
        left_line = lines[posted_idx + 1] if posted_idx + 1 < len(lines) else ''
        org = lines[i + 1] if i + 1 < len(lines) else ''

        # Resolve a real event URL by matching the title string inside the DOM.
        title_node = soup.find(string=lambda s: s and s.strip() == title)
        event_href = None
        if title_node:
            node = title_node.parent
            while node is not None:
                if getattr(node, 'name', None) == 'a' and node.get('href'):
                    event_href = node.get('href')
                    break
                node = node.parent
        if not event_href:
            continue

        start_time = _parse_posted_date(posted_line)
        end_time = _estimate_end_from_left(left_line)

        external_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:90]
        raw_block = lines[i:min(posted_idx + 6, len(lines))]
        events.append({
            'title': title,
            'platform': platform,
            'external_id': external_id,
            'start_time': start_time,
            'end_time': end_time,
            'url': f'https://unstop.com{event_href}' if event_href.startswith('/') else event_href,
            'status': 'upcoming',
            'extra': {
                'organization': org,
                'posted_line': posted_line,
                'time_left_line': left_line,
                'raw_block': raw_block,
                'event_href': event_href,
            },
        })

    # dedupe
    dedup = {}
    for e in events:
        dedup[e['external_id']] = e
    return list(dedup.values())


def fetch_unstop(path: str):
    url = f'https://unstop.com{path}'
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


def fetch_unstop_hackathons():
    return fetch_unstop('/hackathons?oppstatus=open')


def fetch_unstop_workshops():
    return fetch_unstop('/workshops-webinars?oppstatus=open')


def fetch_unstop_conferences():
    return fetch_unstop('/conferences?oppstatus=open')
