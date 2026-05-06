from .source_jsonld_common import fetch_jsonld_source


def fetch_huggingface():
    return fetch_jsonld_source("huggingface", "https://huggingface.co/events", ["ai"], "event")
