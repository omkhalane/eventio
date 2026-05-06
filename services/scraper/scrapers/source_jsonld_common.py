from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode, urlparse, parse_qsl, urlunparse

from bs4 import BeautifulSoup

from .template_scraper import fetch_static, fetch_rendered, normalize_event, SELENIUM_AVAILABLE


def _to_iso(value: str | None) -> str | None:
    if not value:
        return None
    raw = str(value).strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None


def _iter_json_ld_objects(soup: BeautifulSoup) -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []
    for script in soup.select('script[type="application/ld+json"]'):
        text = script.string or script.get_text(strip=True)
        if not text:
            continue
        try:
            parsed = json.loads(text)
        except Exception:
            continue
        if isinstance(parsed, dict):
            objects.append(parsed)
        elif isinstance(parsed, list):
            objects.extend([item for item in parsed if isinstance(item, dict)])
    return objects


def _flatten_events(obj: Any) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    if isinstance(obj, list):
        for item in obj:
            events.extend(_flatten_events(item))
        return events
    if not isinstance(obj, dict):
        return events

    obj_type = obj.get("@type")
    types = [str(x).lower() for x in obj_type] if isinstance(obj_type, list) else [str(obj_type).lower()] if obj_type else []
    if "event" in types:
        events.append(obj)

    for key in ("@graph", "itemListElement", "events"):
        if key in obj:
            events.extend(_flatten_events(obj[key]))
    return events


def _extract_external_id(platform: str, event_obj: dict[str, Any], idx: int) -> str:
    for key in ("identifier", "@id", "url"):
        value = event_obj.get(key)
        if isinstance(value, str) and value.strip():
            return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:120]
    name = str(event_obj.get("name") or f"{platform}-{idx}")
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return f"{platform}-{slug or idx}"[:120]


def _extract_url(event_obj: dict[str, Any], fallback: str) -> str:
    for key in ("url", "@id"):
        value = event_obj.get(key)
        if isinstance(value, str) and value.startswith("http"):
            return value
    return fallback


def _with_page_query(url: str, page: int, page_param: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query[page_param] = str(page)
    return urlunparse(parsed._replace(query=urlencode(query)))


def _derive_status(start_time: str | None, end_time: str | None) -> str:
    now = datetime.now(timezone.utc)
    try:
        if start_time:
            s = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            if s > now:
                return "upcoming"
        if end_time:
            e = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
            if e < now:
                return "past"
            return "ongoing"
    except Exception:
        pass
    return "upcoming"


def fetch_jsonld_source(
    platform: str,
    source_url: str,
    tags: list[str] | None = None,
    event_type: str = "event",
    *,
    max_pages: int = 1,
    page_param: str = "page",
    use_rendered_fallback: bool = True,
) -> list[dict[str, Any]]:
    tags = tags or ["tech-event"]
    extracted: list[dict[str, Any]] = []
    crawled_urls: list[str] = []
    for page in range(1, max_pages + 1):
        page_url = source_url if page == 1 else _with_page_query(source_url, page, page_param)
        html = None
        try:
            html = fetch_static(page_url)
        except Exception as exc:
            if use_rendered_fallback and SELENIUM_AVAILABLE:
                try:
                    html = fetch_rendered(page_url)
                except Exception as rendered_exc:
                    print(f"[{platform}] fetch failed for {page_url}: {exc}; rendered failed: {rendered_exc}")
            else:
                print(f"[{platform}] fetch failed for {page_url}: {exc}")
        if not html:
            continue
        crawled_urls.append(page_url)
        soup = BeautifulSoup(html, "html.parser")
        objects = _iter_json_ld_objects(soup)
        page_events = []
        for obj in objects:
            page_events.extend(_flatten_events(obj))
        if page > 1 and not page_events:
            break
        extracted.extend(page_events)

    if not extracted:
        return []

    out: list[dict[str, Any]] = []
    for idx, event_obj in enumerate(extracted):
        title = event_obj.get("name") or event_obj.get("headline")
        start_time = _to_iso(event_obj.get("startDate"))
        if not title or not start_time:
            continue
        end_time = _to_iso(event_obj.get("endDate"))
        out.append(
            normalize_event(
                {
                    "title": str(title).strip(),
                    "platform": platform,
                    "external_id": _extract_external_id(platform, event_obj, idx),
                    "start_time": start_time,
                    "end_time": end_time,
                    "timezone": "UTC",
                    "event_type": event_type,
                    "tags": tags,
                    "is_online": "offlineeventattendancemode" not in str(event_obj.get("eventAttendanceMode", "")).lower(),
                    "city": None,
                    "country": None,
                    "url": _extract_url(event_obj, source_url),
                    "status": _derive_status(start_time, end_time),
                    "extra": {
                        "source_url": source_url,
                        "crawled_urls": crawled_urls,
                        "event_type_raw": event_obj.get("@type"),
                        "description": event_obj.get("description"),
                        "event_status": event_obj.get("eventStatus"),
                        "event_attendance_mode": event_obj.get("eventAttendanceMode"),
                        "organizer": event_obj.get("organizer"),
                        "location": event_obj.get("location"),
                        "offers": event_obj.get("offers"),
                        "image": event_obj.get("image"),
                        "performer": event_obj.get("performer"),
                        "keywords": event_obj.get("keywords"),
                        "raw_event": event_obj,
                    },
                }
            )
        )

    dedup: dict[tuple[str | None, str | None], dict[str, Any]] = {}
    for event in out:
        dedup[(event.get("platform"), event.get("external_id"))] = event
    return list(dedup.values())
