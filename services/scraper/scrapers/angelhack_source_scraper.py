from __future__ import annotations

import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scappers.scraper_utils import request_json_with_retry
from scappers.scrapers.template_scraper import normalize_event


def _extract_dates_from_html(html: str) -> tuple[str | None, str | None]:
    
    """Extract date range from HTML content."""
    if not html:
        return None, None
    dates = re.findall(r'\b(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})\b', html)
    if not dates:
        return None, None
    parsed = []
    for day, mon, year in dates:
        try:
            dt = datetime.strptime(f"{day} {mon} {year}", "%d %b %Y").replace(tzinfo=timezone.utc)
            parsed.append(dt.strftime("%Y-%m-%dT%H:%M:%SZ"))
        except Exception:
            pass
    if not parsed:
        return None, None
    start = parsed[0]
    end = parsed[1] if len(parsed) > 1 else start
    return start, end


def _status_from_classes(class_list: list[str]) -> str:
    class_str = " ".join(class_list or [])
    if "event-status-ongoing" in class_str:
        return "ongoing"
    if "event-status-past" in class_str:
        return "past"
    if "event-status-upcoming" in class_str:
        return "upcoming"
    return "upcoming"


def _type_from_classes(class_list: list[str]) -> str:
    class_str = " ".join(class_list or [])
    types = re.findall(r"event-type-([a-z0-9-]+)", class_str)
    if not types:
        return "developer event"
    mapping = {
        "hackathon": "hackathon",
        "developer-event": "developer event",
        "incubator": "incubator",
        "accelerator": "accelerator",
        "partnered-programs-events": "partnered programs & events",
        "learn-earn": "learn & earn",
    }
    readable = [mapping.get(t, t.replace("-", " ")) for t in types]
    return readable[0] if len(readable) == 1 else ", ".join(readable)


def fetch_angelhack() -> list[dict[str, Any]]:
    """Fetch AngelHack events from WordPress REST API."""
    events = request_json_with_retry(
        "GET",
        "https://angelhack.com/wp-json/wp/v2/event",
        params={"per_page": 100},
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=20,
        max_attempts=3,
    )
    if not isinstance(events, list):
        return []

    out: list[dict[str, Any]] = []
    for event in events:
        title = event.get("title", {}).get("rendered", "").strip()
        slug = event.get("slug", "").strip()
        url = event.get("link", "").strip()
        content_html = event.get("content", {}).get("rendered", "")
        class_list = event.get("class_list", [])
        event_status = _status_from_classes(class_list)
        event_type = _type_from_classes(class_list)

        start_time, end_time = _extract_dates_from_html(content_html)

        if not slug or not title:
            continue

        out.append(
            normalize_event(
                {
                    "title": title,
                    "platform": "angelhack",
                    "external_id": slug,
                    "start_time": start_time,
                    "end_time": end_time,
                    "timezone": "UTC",
                    "event_type": event_type,
                    "tags": [event_type],
                    "is_online": "virtual" in event_type.lower(),
                    "city": None,
                    "country": None,
                    "url": url,
                    "status": event_status,
                    "extra": {
                        "source": "https://angelhack.com/wp-json/wp/v2/event",
                    },
                }
            )
        )

    out.sort(key=lambda e: (e.get("start_time") or "", e.get("title") or ""))
    return out
