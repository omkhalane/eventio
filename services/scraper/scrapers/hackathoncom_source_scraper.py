from .source_jsonld_common import fetch_jsonld_source


def fetch_hackathoncom():
    return fetch_jsonld_source("hackathoncom", "https://www.hackathon.com", ["hackathon"], "hackathon")
