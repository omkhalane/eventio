from .source_jsonld_common import fetch_jsonld_source


def fetch_luma():
    return fetch_jsonld_source("luma", "https://lu.ma/discover", ["event-aggregator"], "event")
