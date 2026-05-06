from .source_jsonld_common import fetch_jsonld_source


def fetch_gitcoin():
    return fetch_jsonld_source("gitcoin", "https://www.gitcoin.co/hackathons", ["web3"], "hackathon")
