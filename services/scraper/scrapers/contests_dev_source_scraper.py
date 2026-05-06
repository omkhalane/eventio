from __future__ import annotations

from typing import Any, Dict, List

from .template_scraper import normalize_event
from services.scraper.scraper_utils import request_json_with_retry


def _extract_items(payload: Any, list_key: str) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        maybe = payload.get(list_key)
        if isinstance(maybe, list):
            return [x for x in maybe if isinstance(x, dict)]
    return []


def _to_normalized_from_contest(obj: Dict[str, Any]) -> Dict[str, Any]:
    title = obj.get("event") or obj.get("title") or obj.get("name")
    start = obj.get("start")
    end = obj.get("end")
    ext_id = f"contests-{obj.get('id')}"
    url = obj.get("href") or obj.get("url")
    platform = "contests.dev"
    return normalize_event(
        {
            "title": title,
            "platform": platform,
            "external_id": ext_id,
            "start_time": start,
            "end_time": end,
            "timezone": "UTC",
            "event_type": "contest",
            "tags": ["contest"],
            "is_online": True,
            "city": None,
            "country": None,
            "url": url,
            "status": "upcoming",
            "extra": {"raw": obj},
        }
    )


def _to_normalized_from_hackathon(obj: Dict[str, Any]) -> Dict[str, Any]:
    title = obj.get("title")
    start = obj.get("start")
    end = obj.get("end")
    url = obj.get("url")
    src = obj.get("source") or "contests.dev"
    ext_id = f"contests-hack-{(url or title or 'unknown')[:120]}"
    return normalize_event(
        {
            "title": title,
            "platform": "contests.dev",
            "external_id": ext_id,
            "start_time": start,
            "end_time": end,
            "timezone": "UTC",
            "event_type": "hackathon",
            "tags": ["hackathon"],
            "is_online": (obj.get("mode") != "offline"),
            "city": obj.get("place"),
            "country": obj.get("country"),
            "url": url,
            "status": "upcoming",
            "extra": {"raw": obj, "source": src},
        }
    )


def _to_normalized_from_event(obj: Dict[str, Any]) -> Dict[str, Any]:
    title = obj.get("title")
    start = obj.get("start")
    end = obj.get("end")
    url = obj.get("url")
    src = obj.get("source") or "contests.dev"
    ext_id = f"contests-evt-{(url or title or 'unknown')[:120]}"
    return normalize_event(
        {
            "title": title,
            "platform": "contests.dev",
            "external_id": ext_id,
            "start_time": start,
            "end_time": end,
            "timezone": "UTC",
            "event_type": "event",
            "tags": ["event"],
            "is_online": True,
            "city": obj.get("location"),
            "country": None,
            "url": url,
            "status": "upcoming",
            "extra": {"raw": obj, "source": src},
        }
    )


def fetch_contests_dev() -> List[Dict[str, Any]]:
    """Fetch contests.dev aggregated APIs and return normalized events.

    This scrapes the same endpoints used by the site's calendar UI:
    - /api/contests?upcoming=true
    - /api/contests?ongoing=true
    - /api/hackathons
    - /api/events
    """
    base = "https://www.contests.dev"
    out: List[Dict[str, Any]] = []
    try:
        c_up = request_json_with_retry("GET", f"{base}/api/contests", params={"upcoming": "true", "limit": 500})
        objs = _extract_items(c_up, "objects")
        for o in objs or []:
            ev = _to_normalized_from_contest(o)
            out.append(ev)
    except Exception as exc:  # keep scraper robust
        print(f"contests_dev: failed fetching upcoming contests: {exc}")

    try:
        c_ong = request_json_with_retry("GET", f"{base}/api/contests", params={"ongoing": "true", "limit": 100})
        objs = _extract_items(c_ong, "objects")
        for o in objs or []:
            ev = _to_normalized_from_contest(o)
            out.append(ev)
    except Exception as exc:
        print(f"contests_dev: failed fetching ongoing contests: {exc}")

    try:
        h = request_json_with_retry("GET", f"{base}/api/hackathons")
        for o in _extract_items(h, "hackathons"):
            ev = _to_normalized_from_hackathon(o)
            out.append(ev)
    except Exception as exc:
        print(f"contests_dev: failed fetching hackathons: {exc}")

    try:
        e = request_json_with_retry("GET", f"{base}/api/events")
        for o in _extract_items(e, "events"):
            ev = _to_normalized_from_event(o)
            out.append(ev)
    except Exception as exc:
        print(f"contests_dev: failed fetching events: {exc}")

    # deduplicate by (platform, external_id)
    seen = set()
    dedup: List[Dict[str, Any]] = []
    for item in out:
        key = (item.get("platform"), item.get("external_id"))
        if key in seen:
            continue
        seen.add(key)
        dedup.append(item)
    return dedup
