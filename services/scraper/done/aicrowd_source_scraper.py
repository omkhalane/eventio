from __future__ import annotations

from typing import Any, Dict, List

from bs4 import BeautifulSoup

from scappers.scrapers.template_scraper import normalize_event
from scappers.scraper_utils import request_text_with_retry


def _status_from_badge(badge_text: str) -> str:
    text = (badge_text or "").strip().lower()
    if "complete" in text or "ended" in text:
        return "completed"
    if "running" in text or "live" in text or "open" in text:
        return "ongoing"
    if "starting" in text or "soon" in text:
        return "upcoming"
    return "upcoming"


def _collect_cards(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    cards = []
    for card in soup.select("div.card.card-challenge"):
        title_a = card.select_one("h5.card-title a[href]")
        if not title_a:
            continue
        title = title_a.get_text(" ", strip=True)
        href = (title_a.get("href") or "").strip()
        if not href.startswith("/challenges/"):
            continue

        slug = href.split("/challenges/", 1)[-1].strip("/")
        if not slug or "/" in slug:
            continue

        badge = card.select_one(".image-wrapper .badge")
        badge_text = badge.get_text(" ", strip=True) if badge else ""

        tags = []
        for t in card.select(".category-group .badge-outline"):
            raw = t.get_text(" ", strip=True).lstrip("#").strip()
            if raw:
                tags.append(raw)

        organizer_names = []
        for s in card.select(".card-footer a span"):
            nm = s.get_text(" ", strip=True)
            if nm:
                organizer_names.append(nm)

        description = None
        desc_node = card.select_one("p.card-text")
        if desc_node:
            description = desc_node.get_text(" ", strip=True)

        cards.append(
            {
                "title": title,
                "slug": slug,
                "url": f"https://www.aicrowd.com/challenges/{slug}",
                "status": _status_from_badge(badge_text),
                "badge_text": badge_text,
                "tags": tags,
                "description": description,
                "organizers": organizer_names,
            }
        )
    return cards


def fetch_aicrowd() -> list[dict[str, Any]]:
    """Fetch AICrowd challenges from listing pages and normalize them."""
    statuses = ["running", "starting_soon", "completed", "draft"]
    max_pages = 50
    dedup_cards: dict[str, dict[str, Any]] = {}
    base_hosts = ["https://www.aicrowd.com", "https://aicrowd.com"]

    for status in statuses:
        for page in range(1, max_pages + 1):
            html = None
            last_err: Exception | None = None
            for host in base_hosts:
                page_url = f"{host}/challenges?status={status}&page={page}"
                try:
                    html = request_text_with_retry(
                        page_url,
                        headers={"User-Agent": "Mozilla/5.0", "Accept": "text/html"},
                        timeout=20,
                        max_attempts=3,
                    )
                    break
                except Exception as exc:
                    last_err = exc

            if not html:
                if page == 1:
                    print(f"[aicrowd] failed status={status}: {last_err}")
                break

            page_cards = _collect_cards(html)
            if not page_cards:
                break

            for card in page_cards:
                slug = card["slug"]
                existing = dedup_cards.get(slug)
                if existing is None:
                    dedup_cards[slug] = card
                else:
                    if len(card.get("tags", [])) > len(existing.get("tags", [])):
                        existing["tags"] = card.get("tags", [])
                    if len(card.get("organizers", [])) > len(existing.get("organizers", [])):
                        existing["organizers"] = card.get("organizers", [])

    out: list[dict[str, Any]] = []
    for slug, card in dedup_cards.items():
        out.append(
            normalize_event(
                {
                    "title": card.get("title"),
                    "platform": "aicrowd",
                    "external_id": slug,
                    "start_time": None,
                    "end_time": None,
                    "timezone": "UTC",
                    "event_type": "competition",
                    "tags": card.get("tags") or ["ai-competition"],
                    "is_online": True,
                    "city": None,
                    "country": None,
                    "url": card.get("url"),
                    "status": card.get("status", "upcoming"),
                    "extra": {
                        "source": "https://www.aicrowd.com/challenges",
                        "badge_text": card.get("badge_text"),
                        "description": card.get("description"),
                        "organizers": card.get("organizers", []),
                    },
                }
            )
        )

    out.sort(key=lambda e: (e.get("title") or "", e.get("external_id") or ""))
    return out