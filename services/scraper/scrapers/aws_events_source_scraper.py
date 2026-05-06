from .source_jsonld_common import fetch_jsonld_source


def fetch_aws_events():
    return fetch_jsonld_source("aws_events", "https://aws.amazon.com/events", ["big-tech"], "event")
