"""Command line runner for event source scrapers."""
from __future__ import annotations

import argparse
import importlib
import inspect
import json
import pkgutil
from collections.abc import Callable
from pathlib import Path
from typing import Any

from services.scraper.scraper_utils import merge_unique_events
from services.scraper import scrapers


ScraperFn = Callable[[], list[dict[str, Any]]]


def discover_scrapers() -> dict[str, ScraperFn]:
    """Discover no-argument fetch_* functions in scraper modules."""
    discovered: dict[str, ScraperFn] = {}
    for module_info in pkgutil.iter_modules(scrapers.__path__):
        if module_info.name.startswith("_"):
            continue

        module = importlib.import_module(f"{scrapers.__name__}.{module_info.name}")
        for name, candidate in inspect.getmembers(module, inspect.isfunction):
            if not name.startswith("fetch_"):
                continue
            if candidate.__module__ != module.__name__:
                continue
            if inspect.signature(candidate).parameters:
                continue
            source_name = name.removeprefix("fetch_")
            discovered[source_name] = candidate
    return dict(sorted(discovered.items()))


def run_sources(source_names: list[str]) -> list[dict[str, Any]]:
    """Run selected sources and return deduplicated normalized events."""
    registry = discover_scrapers()
    unknown = sorted(set(source_names) - set(registry))
    if unknown:
        raise ValueError(f"Unknown scraper source(s): {', '.join(unknown)}")

    all_events: list[dict[str, Any]] = []
    for source_name in source_names:
        print(f"[scraper] running {source_name}")
        events = registry[source_name]()
        merge_unique_events(all_events, events)
        print(f"[scraper] {source_name}: {len(events)} event(s)")
    return all_events


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run event source scrapers.")
    parser.add_argument(
        "--source",
        action="append",
        dest="sources",
        help="Source name to run. Repeat to run multiple. Defaults to all.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available scraper sources and exit.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Write events as JSON to this file. Defaults to stdout.",
    )
    parser.add_argument(
        "--separate-jsons-dir",
        type=Path,
        help="Directory to write separate JSON files for each source.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    registry = discover_scrapers()

    if args.list:
        for source_name in registry:
            print(source_name)
        return

    selected_sources = args.sources or list(registry)
    
    if args.separate_jsons_dir:
        args.separate_jsons_dir.mkdir(parents=True, exist_ok=True)
        for source_name in selected_sources:
            try:
                print(f"[scraper] running {source_name}")
                events = registry[source_name]()
                out_file = args.separate_jsons_dir / f"{source_name}.json"
                out_file.write_text(json.dumps(events, indent=2, sort_keys=True) + "\n", encoding="utf-8")
                print(f"[scraper] {source_name}: {len(events)} event(s) written to {out_file}")
            except Exception as e:
                print(f"[scraper] {source_name} failed: {e}")
        return

    events = run_sources(selected_sources)

    payload = json.dumps(events, indent=2, sort_keys=True)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload + "\n", encoding="utf-8")
        print(f"[scraper] wrote {len(events)} event(s) to {args.output}")
    else:
        print(payload)


if __name__ == "__main__":
    main()
