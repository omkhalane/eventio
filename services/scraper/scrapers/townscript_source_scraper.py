from .source_jsonld_common import fetch_jsonld_source


def fetch_townscript():
    return fetch_jsonld_source("townscript", "https://www.townscript.com/online", ["event-platform"], "event")
