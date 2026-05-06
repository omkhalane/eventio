from .source_jsonld_common import fetch_jsonld_source


def fetch_openai():
    return fetch_jsonld_source("openai", "https://openai.com/events", ["ai"], "event")
