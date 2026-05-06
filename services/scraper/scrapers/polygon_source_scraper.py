from .source_jsonld_common import fetch_jsonld_source


def fetch_polygon():
    return fetch_jsonld_source("polygon", "https://polygon.technology/events", ["web3"], "hackathon")
