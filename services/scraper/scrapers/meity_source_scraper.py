from .source_jsonld_common import fetch_jsonld_source


def fetch_meity():
    return fetch_jsonld_source("meity", "https://www.meity.gov.in/current-news", ["government"], "event")
