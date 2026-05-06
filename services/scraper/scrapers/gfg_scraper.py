import requests
import json
from datetime import datetime, timezone
import time

from scappers.scraper_utils import merge_unique_events, request_json_with_retry

def process_gfg_contests(events_data, status):
    processed = []
    
    for c in events_data:
        title = c.get("name")
        platform = "geeksforgeeks"
        external_id = c.get("slug")
        
        start_time = None
        end_time = None
        if c.get("start_time"):
            try:
                dt = datetime.fromisoformat(c["start_time"])
                start_dt_utc = dt.astimezone(timezone.utc)
                start_time = start_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            except Exception:
                pass
                
        if c.get("end_time"):
            try:
                dt = datetime.fromisoformat(c["end_time"])
                end_dt_utc = dt.astimezone(timezone.utc)
                end_time = end_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            except Exception:
                pass
                
        event_data = {
            "title": title,
            "platform": platform,
            "external_id": external_id,
            "start_time": start_time,
            "end_time": end_time,
            "timezone": "UTC",
            "event_type": "contest",
            "tags": ["competitive-programming"],
            "is_online": True,
            "city": None,
            "country": None,
            "url": f"https://practice.geeksforgeeks.org/contest/{external_id}",
            "is_free": True,
            "price": None,
            "currency": None,
            "status": status,
            "extra": {
                "type": c.get("type"),
                "sub_type": c.get("sub_type")
            }
        }
        processed.append(event_data)
        
    return processed

def fetch_gfg():
    print("Fetching contests from GeeksforGeeks (Paginated, retrying until exhausted)...")
    headers = {"User-Agent": "Mozilla/5.0"}
    all_events = []
    
    try:
        page = 1
        while True:
            url = f"https://practiceapi.geeksforgeeks.org/api/vr/events/?page_number={page}&sub_type=all&type=contest"
            data = request_json_with_retry("GET", url, headers=headers)
            results = data.get("results", {})
            
            upcoming = process_gfg_contests(results.get("upcoming", []), "upcoming")
            ongoing = process_gfg_contests(results.get("ongoing", []), "ongoing")
            past = process_gfg_contests(results.get("past", []), "past")
            
            batch = upcoming + ongoing + past
            added_events = merge_unique_events(all_events, batch)
            if not added_events:
                break
            page += 1
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Error fetching GFG: {e}")
        
    print(f"Fetched {len(all_events)} contests from GeeksForGeeks.")
    with open("gfg_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)

if __name__ == "__main__":
    fetch_gfg()
