from .source_jsonld_common import fetch_jsonld_source


def fetch_paytm_insider():
    return fetch_jsonld_source("paytm_insider", "https://insider.in/online", ["event-platform"], "event")
