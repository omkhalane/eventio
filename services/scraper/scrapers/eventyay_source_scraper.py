from .source_jsonld_common import fetch_jsonld_source


def fetch_eventyay():
    return fetch_jsonld_source("eventyay", "https://eventyay.com/events", ["event-platform"], "event")
