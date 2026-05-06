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


def merge_unique_events(
    existing_events: list[dict[str, Any]],
    new_events: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Merge events by external_id.

    When ``new_events`` is provided, append only unseen events to
    ``existing_events`` and return the events that were added. When omitted,
    return a deduplicated copy of ``existing_events``.
    """
    seen_ids = {
        event.get("external_id")
        for event in existing_events
        if event.get("external_id")
    }

    if new_events is None:
        deduped: list[dict[str, Any]] = []
        deduped_ids: set[str] = set()
        for event in existing_events:
            ext_id = event.get("external_id")
            if not ext_id:
                continue
            if ext_id in deduped_ids:
                continue
            deduped.append(event)
            deduped_ids.add(ext_id)
        return deduped

    added: list[dict[str, Any]] = []
    for event in new_events:
        ext_id = event.get("external_id")
        if not ext_id or ext_id in seen_ids:
            continue
        existing_events.append(event)
        added.append(event)
        seen_ids.add(ext_id)
    return added
