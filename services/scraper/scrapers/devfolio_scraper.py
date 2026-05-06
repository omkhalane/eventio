"""Scraper for Devfolio (https://devfolio.co/hackathons/open)."""
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def parse_events_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    # Devfolio currently renders mostly shell/navigation in accessible HTML for this page.
    # Only accept explicit card-like anchors with a title/date block.
    for a in soup.find_all('a', href=True):
        href = a['href']
        if not href.startswith('/hackathons/'):
            continue
        text = a.get_text(' ', strip=True)
        if not text or text.lower() in {'back to all hackathons', 'explore hackathons'}:
            continue
        if not re.search(r'\b\w{3,9}\s+\d{1,2}\s*-\s*\w{3,9}\s+\d{1,2},\s*\d{4}\b', text):
            continue
        title = text.split('  ')[0].strip()
        url = urljoin('https://devfolio.co', href)
        external_id = href.rstrip('/').split('/')[-1]
        events.append({'title': title, 'platform': 'devfolio', 'external_id': external_id, 'start_time': None, 'end_time': None, 'url': url, 'extra': {'card_text': text}})
    return events


def fetch_devfolio():
    url = 'https://devfolio.co/hackathons/open'
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        html = fetch_rendered(url)
        events = parse_events_from_html(html)
    return [normalize_event(e) for e in events]
