from .source_jsonld_common import fetch_jsonld_source


def fetch_topcoder():
    return fetch_jsonld_source("topcoder", "https://www.topcoder.com/challenges", ["competitive-programming"], "competition")
