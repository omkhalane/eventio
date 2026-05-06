import requests
import json
from datetime import datetime, timezone
import time

from scappers.scraper_utils import merge_unique_events, request_json_with_retry

def process_codechef_contests(contests_data):
    processed = []
    
    categories = [
        ("upcoming", contests_data.get("future_contests", [])),
        ("ongoing", contests_data.get("present_contests", [])),
        ("past", contests_data.get("past_contests", []))
    ]
    
    for status, contests in categories:
        for c in contests:
            title = c.get("contest_name")
            platform = "codechef"
            external_id = c.get("contest_code")
            
            start_time = None
            end_time = None
            
            try:
                if c.get("contest_start_date_iso"):
                    dt = datetime.fromisoformat(c["contest_start_date_iso"]).astimezone(timezone.utc)
                    start_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
                if c.get("contest_end_date_iso"):
                    dt = datetime.fromisoformat(c["contest_end_date_iso"]).astimezone(timezone.utc)
                    end_time = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
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
                "url": f"https://www.codechef.com/{external_id}",
                "is_free": True,
                "price": None,
                "currency": None,
                "status": status,
                "extra": {
                    "durationMinutes": c.get("contest_duration"),
                    "distinct_users": c.get("distinct_users"),
                    "contest_code": c.get("contest_code"),
                    "contest_start_date": c.get("contest_start_date"),
                    "contest_end_date": c.get("contest_end_date"),
                    "contest_start_date_iso": c.get("contest_start_date_iso"),
                    "contest_end_date_iso": c.get("contest_end_date_iso"),
                    "raw": c,
                }
            }
            processed.append(event_data)
            
    return processed

def fetch_codechef():
    print("Fetching contests from CodeChef (Paginated, retrying until exhausted)...")
    headers = {"User-Agent": "Mozilla/5.0"}
    all_events = []
    offset = 0
    
    try:
        while True:
            url = f"https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset={offset}&mode=all"
            data = request_json_with_retry("GET", url, headers=headers)
            
            batch = process_codechef_contests(data)
            added_events = merge_unique_events(all_events, batch)
            if not added_events:
                break
            offset += max(len(batch), 1)
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Error fetching CodeChef: {e}")
        
    print(f"Fetched {len(all_events)} contests from CodeChef.")
    with open("codechef_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)

if __name__ == "__main__":
    fetch_codechef()
