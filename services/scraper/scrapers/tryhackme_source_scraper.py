from .source_jsonld_common import fetch_jsonld_source


def fetch_tryhackme():
    return fetch_jsonld_source("tryhackme", "https://tryhackme.com/r/hacktivities", ["security"], "competition")
