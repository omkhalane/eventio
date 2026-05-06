from .source_jsonld_common import fetch_jsonld_source


def fetch_hackclub():
    return fetch_jsonld_source("hackclub", "https://hackclub.com", ["community"], "event")
