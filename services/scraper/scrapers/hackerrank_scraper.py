import requests
import json
from datetime import datetime, timezone
import time

from services.scraper.scraper_utils import merge_unique_events, request_json_with_retry

def process_hackerrank_contests(contests):
    processed = []
    
    for c in contests:
        title = c.get("name")
        platform = "hackerrank"
        external_id = c.get("slug")
        
        start_time = None
        end_time = None
        if c.get("epoch_starttime"):
            dt = datetime.fromtimestamp(c["epoch_starttime"], tz=timezone.utc)
            start_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        if c.get("epoch_endtime"):
            dt = datetime.fromtimestamp(c["epoch_endtime"], tz=timezone.utc)
            end_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                
        started = c.get("started")
        ended = c.get("ended")
        if ended:
            status = "past"
        elif started:
            status = "ongoing"
        else:
            status = "upcoming"
            
        event_data = {
            "title": title,
            "platform": platform,
            "external_id": str(c.get("id", external_id)),
            "start_time": start_time,
            "end_time": end_time,
            "timezone": "UTC",
            "event_type": "contest",
            "tags": ["competitive-programming"],
            "is_online": True,
            "city": None,
            "country": None,
            "url": f"https://www.hackerrank.com/contests/{external_id}",
            "is_free": True,
            "price": None,
            "currency": None,
            "status": status,
            "extra": {
                "rated": c.get("rated", False)
            }
        }
        processed.append(event_data)
        
    return processed

def fetch_hackerrank():
    print("Fetching contests from HackerRank (Upcoming & Archived paginated, retrying until exhausted)...")
    headers = {"User-Agent": "Mozilla/5.0"}
    all_events = []
    offset = 0
    limit = 100
    
    try:
        # Upcoming
        while True:
            url = f"https://www.hackerrank.com/rest/contests/upcoming?offset={offset}&limit={limit}"
            data = request_json_with_retry("GET", url, headers=headers)
            models = data.get("models", [])
            batch = process_hackerrank_contests(models)
            added_events = merge_unique_events(all_events, batch)
            if not added_events:
                break
            offset += max(len(models), 1)
            time.sleep(0.5)
            
        # Archived
        offset = 0
        while True:
            url = f"https://www.hackerrank.com/rest/contests/archived?offset={offset}&limit={limit}"
            data = request_json_with_retry("GET", url, headers=headers)
            models = data.get("models", [])
            batch = process_hackerrank_contests(models)
            added_events = merge_unique_events(all_events, batch)
            if not added_events:
                break
            offset += max(len(models), 1)
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Error fetching HackerRank: {e}")
        
    print(f"Fetched {len(all_events)} contests from HackerRank.")
    with open("hackerrank_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)

if __name__ == "__main__":
    fetch_hackerrank()
