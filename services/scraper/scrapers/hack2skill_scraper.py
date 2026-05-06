"""Scraper for Hack2Skill hackathons listing."""
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
from datetime import datetime, timezone

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def _parse_deadline_line(line: str):
    # Example: "Sun, Mar 01, 2026 (IST)"
    m = re.search(r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})', line)
    if not m:
        return None
    try:
        dt = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%b %d %Y").replace(tzinfo=timezone.utc)
        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    except Exception:
        return None


def parse_events_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    seen_titles = set()
    for title_node in soup.select('p[title]'):
        title = (title_node.get('title') or title_node.get_text(' ', strip=True) or '').strip()
        if not title or len(title) < 4:
            continue
        if title.lower() in {'featured', 'all hackathons', 'ongoing registration'}:
            continue

        # Ascend to the card container that also includes the Register Now link.
        container = title_node
        for _ in range(6):
            container = container.parent
            if not container:
                break
            if getattr(container, 'name', None) == 'div' and 'border' in ' '.join(container.get('class', [])):
                break
        if not container:
            continue

        link = container.find('a', href=re.compile(r'^/event/'))
        if not link or not link.get('href'):
            continue
        href = link.get('href')

        card_text = container.get_text(' ', strip=True)
        if 'Registrations Ends On' not in card_text:
            continue
        deadline_match = re.search(r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+[A-Za-z]{3}\s+\d{1,2},\s*\d{4}\s*\(IST\)', card_text)
        if not deadline_match:
            continue
        end_time = _parse_deadline_line(deadline_match.group(0))

        external_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:90]
        if external_id in seen_titles:
            continue
        seen_titles.add(external_id)
        events.append({
            'title': title,
            'platform': 'hack2skill',
            'external_id': external_id,
            'start_time': None,
            'end_time': end_time,
            'url': f'https://hack2skill.com{href}' if href.startswith('/') else href,
            'status': 'upcoming',
            'extra': {
                'card_text': card_text[:500],
                'event_href': href,
            },
        })

    dedup = {}
    for e in events:
        dedup[e['external_id']] = e
    return list(dedup.values())


def fetch_hack2skill():
    url = 'https://hack2skill.com/hackathons-listing'
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
