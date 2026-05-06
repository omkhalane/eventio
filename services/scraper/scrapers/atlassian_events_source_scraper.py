from .source_jsonld_common import fetch_jsonld_source


def fetch_atlassian_events():
    return fetch_jsonld_source("atlassian_events", "https://events.atlassian.com", ["big-tech"], "event")
