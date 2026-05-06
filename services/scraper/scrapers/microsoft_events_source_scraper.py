from .source_jsonld_common import fetch_jsonld_source


def fetch_microsoft_events():
    return fetch_jsonld_source("microsoft_events", "https://events.microsoft.com", ["big-tech"], "event")
