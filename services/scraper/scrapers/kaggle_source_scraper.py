from .source_jsonld_common import fetch_jsonld_source


def fetch_kaggle():
    return fetch_jsonld_source("kaggle", "https://www.kaggle.com/competitions", ["ai-competition"], "competition")
