from .source_jsonld_common import fetch_jsonld_source


def fetch_isro():
    return fetch_jsonld_source("isro", "https://www.isro.gov.in/updates", ["government"], "competition")
