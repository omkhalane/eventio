from .source_jsonld_common import fetch_jsonld_source


def fetch_nvidia_events():
    return fetch_jsonld_source("nvidia_events", "https://developer.nvidia.com/events", ["big-tech"], "event")
