from .source_jsonld_common import fetch_jsonld_source


def fetch_google_developers():
    return fetch_jsonld_source("google_developers", "https://developers.google.com/events", ["big-tech"], "event")
