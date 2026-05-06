from .source_jsonld_common import fetch_jsonld_source


def fetch_salesforce_events():
    return fetch_jsonld_source("salesforce_events", "https://www.salesforce.com/events", ["big-tech"], "event")
