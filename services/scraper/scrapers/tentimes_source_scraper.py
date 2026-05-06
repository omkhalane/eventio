from .source_jsonld_common import fetch_jsonld_source


def fetch_tentimes():
    return fetch_jsonld_source("10times", "https://10times.com/online", ["event-aggregator"], "event")
