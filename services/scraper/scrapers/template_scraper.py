"""Template scraper used as a starting point for each hackathon source.

Provides static HTML fetch and Selenium-rendered fallback, and normalizes
events into a common schema.
"""
from __future__ import annotations

import json
from datetime import datetime,timezone
from typing import List

from bs4 import BeautifulSoup

import sys

from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from services.scraper.scraper_utils import request_text_with_retry, merge_unique_events

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except Exception:
    SELENIUM_AVAILABLE = False


def normalize_event(raw: dict) -> dict:
    """Convert site-specific raw event dict into normalized schema."""
    extra = raw.get("extra") or {}
    if not extra:
        extra = {"source_platform": raw.get("platform")}
    # Required fields: title, platform, external_id, start_time, end_time, url
    return {
        "title": raw.get("title"),
        "platform": raw.get("platform"),
        "external_id": raw.get("external_id"),
        "start_time": raw.get("start_time"),
        "end_time": raw.get("end_time"),
        "timezone": raw.get("timezone", "UTC"),
        "event_type": raw.get("event_type", "hackathon"),
        "tags": raw.get("tags", []),
        "is_online": raw.get("is_online", True),
        "city": raw.get("city"),
        "country": raw.get("country"),
        "url": raw.get("url"),
        "is_free": raw.get("is_free", None),
        "price": raw.get("price"),
        "currency": raw.get("currency"),
        "status": raw.get("status", "upcoming"),
        "extra": extra,
    }


def fetch_static(url: str, headers: dict | None = None) -> str:
    return request_text_with_retry(url, headers=headers or {"User-Agent": "Mozilla/5.0"})


def fetch_rendered(url: str) -> str:
    if not SELENIUM_AVAILABLE:
        raise RuntimeError("Selenium not available in environment")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get(url)
        # Allow JS to load. Specific scrapers may override and interact.
        driver.implicitly_wait(2)
        return driver.page_source
    finally:
        driver.quit()


def parse_events_from_html(html: str) -> List[dict]:
    """Stub parser: should be implemented per-site."""
    soup = BeautifulSoup(html, "html.parser")
    return []


def fetch_all(url: str) -> List[dict]:
    """Attempt static fetch, then rendered fetch if needed, and parse events."""
    events = []
    try:
        html = fetch_static(url)
        events = parse_events_from_html(html)
    except Exception:
        pass
    if not events and SELENIUM_AVAILABLE:
        try:
            html = fetch_rendered(url)
            events = parse_events_from_html(html)
        except Exception:
            pass
    # Normalize
    return [normalize_event(e) for e in events]
