from .source_jsonld_common import fetch_jsonld_source


def fetch_solana():
    return fetch_jsonld_source("solana", "https://solana.com/events", ["web3"], "hackathon")
