from .source_jsonld_common import fetch_jsonld_source


def fetch_smart_india_hackathon():
    return fetch_jsonld_source("smart_india_hackathon", "https://sih.gov.in", ["government"], "hackathon")
