from .source_jsonld_common import fetch_jsonld_source


def fetch_startup_india():
    return fetch_jsonld_source("startup_india", "https://www.startupindia.gov.in", ["government"], "event")
