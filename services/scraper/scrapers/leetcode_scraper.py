import requests
import json
import time
from datetime import datetime, timezone, timedelta

from services.scraper.scraper_utils import request_json_with_retry

def process_leetcode_contests(contests_data):
    processed = []
    for c in contests_data:
        title = c.get("title")
        slug = c.get("titleSlug")
        
        # Identity
        platform = "leetcode"
        external_id = slug
        
        # Time
        start_time = None
        end_time = None
        if c.get("startTime"):
            start_dt_utc = datetime.fromtimestamp(c["startTime"], tz=timezone.utc)
            start_time = start_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            if c.get("duration"):
                end_dt_utc = start_dt_utc + timedelta(seconds=c["duration"])
                end_time = end_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
                
        # Classification
        event_type = "contest"
        tags = ["competitive-programming", "interview-prep"]
        
        # Mode & Location
        is_online = True
        city = None
        country = None
        
        # Core Links
        url = f"https://leetcode.com/contest/{slug}"
        
        # Access
        is_free = True
        price = None
        currency = None
        
        # Status
        now = datetime.now(timezone.utc).timestamp()
        start = c.get("startTime", 0)
        end = start + c.get("duration", 0)
        if now < start:
            status = "upcoming"
        elif now <= end:
            status = "ongoing"
        else:
            status = "past"
            
        event_data = {
            "title": title,
            "platform": platform,
            "external_id": external_id,
            "start_time": start_time,
            "end_time": end_time,
            "timezone": "UTC",
            "event_type": event_type,
            "tags": tags,
            "is_online": is_online,
            "city": city,
            "country": country,
            "url": url,
            "is_free": is_free,
            "price": price,
            "currency": currency,
            "status": status,
            "extra": {
                "durationSeconds": c.get("duration")
            }
        }
        processed.append(event_data)
        
    return processed

def fetch_leetcode():
    print("Fetching contests from LeetCode GraphQL with continuous retry...")
    url = "https://leetcode.com/graphql"
    query = """
    query {
      allContests {
        title
        titleSlug
        startTime
        duration
      }
    }
    """
    try:
        while True:
            data = request_json_with_retry(
                "POST",
                url,
                headers={"Content-Type": "application/json"},
                json_body={"query": query},
            )
            if data.get("errors"):
                print(f"LeetCode GraphQL returned errors: {data['errors']}. Retrying...")
                time.sleep(2)
                continue
            break
        contests = data.get("data", {}).get("allContests", [])
        
        events = process_leetcode_contests(contests)
        print(f"Fetched {len(events)} contests from LeetCode.")
        
        with open("leetcode_contests.json", "w", encoding="utf-8") as f:
            json.dump(events, f, indent=4)
        print("Saved to leetcode_contests.json")
        
    except Exception as e:
        print(f"Error fetching LeetCode: {e}")

if __name__ == "__main__":
    fetch_leetcode()
