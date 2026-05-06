from .source_jsonld_common import fetch_jsonld_source


def fetch_taikai():
    return fetch_jsonld_source("taikai", "https://taikai.network/hackathons", ["hackathon"], "hackathon")
