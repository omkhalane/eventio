from .source_jsonld_common import fetch_jsonld_source


def fetch_encode_club():
    return fetch_jsonld_source("encode_club", "https://www.encode.club", ["web3"], "event")
