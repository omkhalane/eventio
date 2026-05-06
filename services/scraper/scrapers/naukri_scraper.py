import requests
import json
from datetime import datetime, timezone
import time

from scappers.scraper_utils import merge_unique_events, request_json_with_retry

def process_naukri_contests(events_data):
    processed = []
    
    for c in events_data:
        title = c.get("name")
        platform = "naukri-code360"
        external_id = c.get("slug")
        
        start_time = None
        end_time = None
        
        if c.get("event_start_time"):
            try:
                dt = datetime.fromtimestamp(c["event_start_time"], tz=timezone.utc)
                start_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            except Exception:
                pass
                
        if c.get("event_end_time"):
            try:
                dt = datetime.fromtimestamp(c["event_end_time"], tz=timezone.utc)
                end_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            except Exception:
                pass
                
        status = "upcoming"
        now = datetime.now(timezone.utc).timestamp()
        start = c.get("event_start_time", 0)
        end = c.get("event_end_time", 0)
        
        if now < start:
            status = "upcoming"
        elif now <= end:
            status = "ongoing"
        else:
            status = "past"
        
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
            "url": f"https://www.naukri.com/code360/contests/{external_id}",
            "is_free": True,
            "price": None,
            "currency": None,
            "status": status,
            "extra": {
                "difficulty": c.get("difficulty")
            }
        }
        processed.append(event_data)
        
    return processed

def fetch_naukri():
    print("Fetching contests from Naukri Code360 (Paginated, retrying until exhausted)...")
    headers = {"User-Agent": "Mozilla/5.0"}
    all_events = []
    page = 1
    
    try:
        while True:
            url = f"https://api.codingninjas.com/api/v3/public_section/contest_list?page={page}"
            data = request_json_with_retry("GET", url, headers=headers)
            events = data.get("data", {}).get("events", [])
            batch = process_naukri_contests(events)
            added_events = merge_unique_events(all_events, batch)
            if not added_events:
                break
            
            page_details = data.get("data", {}).get("page_details", {})
            current_page = page_details.get("current_page", page)
            total_pages = page_details.get("total_pages", page)
            if current_page >= total_pages:
                break
                
            page += 1
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Error fetching Naukri Code360: {e}")
        
    print(f"Fetched {len(all_events)} contests from Naukri Code360.")
    with open("naukri_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)

if __name__ == "__main__":
    fetch_naukri()
