"""Scraper for Hackerearth hackathons listing."""
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
import json
from datetime import datetime, timezone

from .template_scraper import fetch_static, fetch_rendered, normalize_event
try:
    from services.scraper.scraper_utils import request_text_with_retry
except Exception:
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from services.scraper.scraper_utils import request_text_with_retry


def _to_iso(value):
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None


def _extract_event_dates_from_detail(url: str):
    try:
        html = request_text_with_retry(url, headers={"User-Agent": "Mozilla/5.0"})
    except Exception:
        return None, None, {}
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.select('script[type="application/ld+json"]'):
        text = script.get_text(strip=True)
        if not text:
            continue
        try:
            payload = json.loads(text)
        except Exception:
            continue
        nodes = payload if isinstance(payload, list) else [payload]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            raw_type = node.get("@type")
            types = [str(t).lower() for t in raw_type] if isinstance(raw_type, list) else [str(raw_type).lower()]
            if "event" not in types:
                continue
            return _to_iso(node.get("startDate")), _to_iso(node.get("endDate")), {"raw_event": node}
    return None, None, {}


def parse_events_from_html(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/hackathon/' in href or '/challenges/' in href:
            title = a.get_text(strip=True)
            url = urljoin('https://www.hackerearth.com', href)
            external_id = href.rstrip('/').split('/')[-1]
            start_time, end_time, extra = _extract_event_dates_from_detail(url)
            events.append(
                {
                    'title': title,
                    'platform': 'hackerearth',
                    'external_id': external_id,
                    'start_time': start_time,
                    'end_time': end_time,
                    'url': url,
                    'extra': extra or {"listing_href": href},
                }
            )
    return events


def fetch_hackerearth():
    url = 'https://www.hackerearth.com/challenges/hackathon/'
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        try:
            html = fetch_rendered(url)
            events = parse_events_from_html(html)
        except Exception:
            events = []
    return [normalize_event(e) for e in events]
