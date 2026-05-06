"""Scraper for Devpost hackathons (https://devpost.com/hackathons)."""
from bs4 import BeautifulSoup
import re
from datetime import datetime

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def _try_parse_date(s: str):
    s = s.strip()
    # Try formats like 'Apr 15, 2026' or 'April 15, 2026'
    for fmt in ('%b %d, %Y', '%B %d, %Y'):
        try:
            return datetime.strptime(s, fmt).strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            continue
    return None


def parse_events_from_html(html: str):
    """Parse Devpost rendered page by reading each hackathon card anchor.

    Devpost cards are wrapped in `a.tile-anchor` and include the title, URL and
    date/prize metadata in the same card text.
    """
    soup = BeautifulSoup(html, "html.parser")
    events = []

    # pattern for date range: "Apr 09 - May 20, 2026" etc.
    reg_range_re = re.compile(r'([A-Za-z]{3,9} \d{1,2})\s*-\s*([A-Za-z]{3,9} \d{1,2},?\s*\d{4})')

    def is_title_candidate(s: str) -> bool:
        if not s or len(s) < 4 or len(s) > 120:
            return False
        low = s.lower()
        if low.startswith(('join', 'host', 'browse', 'search', 'showing', 'recently', 'prize', 'sort', 'online')):
            return False
        if any(x in low for x in (
            'in prizes', 'non-cash prizes', 'days left', 'hours left', 'featured',
            'beginner friendly', 'machine learning', 'social good', 'open ended',
            'clear filters', 'match my eligibility', 'submission date', 'most relevant',
            'devpost, inc.', 'public', 'invite only', 'location', 'status', 'length',
            'interest tags', 'show more', 'select host', 'open to', 'resources', 'settings'
        )):
            return False
        # avoid lines that are mostly numbers or currency
        if re.fullmatch(r'[\d\W_,$%]+', s):
            return False
        if any(c.isdigit() for c in s) and len(s.split()) <= 2:
            return False
        # require at least one TitleCase-like word
        for w in s.split():
            if len(w) > 1 and w[0].isupper() and (any(c.islower() for c in w[1:])):
                return True
        # also accept single-word names with mixed case like ZerveHack
        if any(ch.isalpha() for ch in s) and (sum(1 for c in s if c.isupper()) > 0):
            return True
        return False

    for card in soup.select('a.tile-anchor'):
        href = card.get('href')
        if not href:
            continue
        title_node = card.find('h3')
        title = title_node.get_text(' ', strip=True) if title_node else card.get_text(' ', strip=True)
        if not is_title_candidate(title):
            continue

        card_text = card.get_text(separator=' ', strip=True)
        m = reg_range_re.search(card_text)
        if not m:
            continue

        start_raw = m.group(1)
        end_raw = m.group(2)
        if ',' not in start_raw and ',' in end_raw:
            year = end_raw.split(',')[-1].strip()
            start_raw_full = f"{start_raw}, {year}"
        else:
            start_raw_full = start_raw

        start_iso = _try_parse_date(start_raw_full)
        end_iso = _try_parse_date(end_raw)
        if not (start_iso and end_iso):
            continue

        external_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:80]
        raw = {
            'title': title,
            'platform': 'devpost',
            'external_id': external_id,
            'start_time': start_iso,
            'end_time': end_iso,
            'url': href,
            'extra': {'registration_period': f"{start_raw_full} - {end_raw}", 'card_text': card_text},
        }
        events.append(raw)

    # dedupe by external_id
    dedup = {}
    for e in events:
        dedup[e['external_id']] = e
    return list(dedup.values())


def fetch_devpost():
    url = 'https://devpost.com/hackathons'
    # Try static first; if no events found, fall back to rendered
    events = []
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        events = []
    if not events and 'fetch_rendered' in globals():
        try:
            html = fetch_rendered(url)
            events = parse_events_from_html(html)
        except Exception:
            events = []
    return [normalize_event(e) for e in events]


if __name__ == '__main__':
    ev = fetch_devpost()
    print(len(ev))
