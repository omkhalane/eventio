from .source_jsonld_common import fetch_jsonld_source


def fetch_zindi():
    return fetch_jsonld_source("zindi", "https://zindi.africa/competitions", ["ai-competition"], "competition")
