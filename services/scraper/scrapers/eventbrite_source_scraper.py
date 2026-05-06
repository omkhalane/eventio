from .source_jsonld_common import fetch_jsonld_source


def fetch_eventbrite():
    return fetch_jsonld_source("eventbrite", "https://www.eventbrite.com/d/online/hackathon", ["event-aggregator"], "event")
