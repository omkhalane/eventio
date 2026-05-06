"""Scraper for Lablab.ai AI hackathons (https://lablab.ai/ai-hackathons)."""
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from .template_scraper import fetch_static, fetch_rendered, normalize_event


def parse_events_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    for card in soup.find_all(['div', 'article']):
        text = card.get_text(separator=' ', strip=True)
        if 'hackathon' in text.lower():
            a = card.find('a', href=True)
            if a:
                href = a['href']
                url = urljoin('https://lablab.ai', href)
                title = a.get_text(strip=True)
                external_id = href.rstrip('/').split('/')[-1]
                events.append({'title': title, 'platform': 'lablab', 'external_id': external_id, 'start_time': None, 'end_time': None, 'url': url})
    return events


def fetch_lablab():
    url = 'https://lablab.ai/ai-hackathons'
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        html = fetch_rendered(url)
        events = parse_events_from_html(html)
    return [normalize_event(e) for e in events]
