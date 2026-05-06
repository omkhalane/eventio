from .source_jsonld_common import fetch_jsonld_source


def fetch_ethglobal():
    return fetch_jsonld_source("ethglobal", "https://ethglobal.com/events", ["web3"], "hackathon")
