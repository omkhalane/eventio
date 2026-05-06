from .source_jsonld_common import fetch_jsonld_source


def fetch_hackster():
    return fetch_jsonld_source("hackster", "https://www.hackster.io/contests", ["hackathon"], "competition")
