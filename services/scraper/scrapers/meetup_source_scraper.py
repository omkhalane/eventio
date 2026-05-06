from .source_jsonld_common import fetch_jsonld_source


def fetch_meetup():
    return fetch_jsonld_source("meetup", "https://www.meetup.com/find/?keywords=hackathon", ["event-aggregator"], "meetup")
