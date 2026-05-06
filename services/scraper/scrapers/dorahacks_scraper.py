"""Scraper for Dorahacks (https://dorahacks.io/hackathon)."""
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def parse_events_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/hackathon' in href:
            title = a.get_text(strip=True)
            url = urljoin('https://dorahacks.io', href)
            external_id = href.rstrip('/').split('/')[-1]
            events.append({'title': title, 'platform': 'dorahacks', 'external_id': external_id, 'start_time': None, 'end_time': None, 'url': url})
    return events


def fetch_dorahacks():
    url = 'https://dorahacks.io/hackathon'
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        html = fetch_rendered(url)
        events = parse_events_from_html(html)
    return [normalize_event(e) for e in events]
