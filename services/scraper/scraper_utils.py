"""Utilities for scraping event data."""
from __future__ import annotations

import time
from typing import Any

import requests


def request_json_with_retry(
    method: str,
    url: str,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: int = 30,
    max_attempts: int = 3,
) -> Any:
    """Fetch JSON from a URL with retry logic."""
    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.request(
                method,
                url,
                params=params,
                headers=headers or {},
                timeout=timeout,
            )
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            if attempt < max_attempts:
                wait_time = 1.5 ** attempt
                print(f"Request failed for {url} (attempt {attempt}/{max_attempts}): {exc}. Retrying in {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                raise


def request_text_with_retry(
    url: str,
    headers: dict[str, str] | None = None,
    timeout: int = 30,
    max_attempts: int = 3,
) -> str:
    """Fetch text from a URL with retry logic."""
    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(
                url,
                headers=headers or {},
                timeout=timeout,
            )
            response.raise_for_status()
            return response.text
        except Exception as exc:
            if attempt < max_attempts:
                wait_time = 1.5 ** attempt
                print(f"Request failed for {url} (attempt {attempt}/{max_attempts}): {exc}. Retrying in {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                raise


def merge_unique_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate events by external_id."""
    seen: dict[str, dict[str, Any]] = {}
    for event in events:
        ext_id = event.get("external_id")
        if ext_id and ext_id not in seen:
            seen[ext_id] = event
    return list(seen.values())
