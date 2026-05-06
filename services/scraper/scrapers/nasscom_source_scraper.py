from .source_jsonld_common import fetch_jsonld_source


def fetch_nasscom():
    return fetch_jsonld_source("nasscom", "https://nasscom.in/events", ["industry"], "event")
