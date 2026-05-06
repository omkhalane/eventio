import requests
import json
import time
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

sys.path.append(str(Path(__file__).resolve().parents[1]))

from scappers.scraper_utils import request_json_with_retry

def get_status(phase):
    """Maps Codeforces phases to universal status values."""
    if phase == "BEFORE":
        return "upcoming"
    elif phase in ["CODING", "PENDING_SYSTEM_TEST", "SYSTEM_TEST"]:
        return "ongoing"
    elif phase == "FINISHED":
        return "past"
    else:
        # Default to past if unknown
        return "unknown"

def process_contests(contests, is_gym=False):
    processed_contests = []
    
    for c in contests:
        # 1. Identity
        title = c.get("name")
        platform = "codeforces"
        external_id = str(c.get("id"))
        
        # 2. Time
        start_time = None
        end_time = None
        if 'startTimeSeconds' in c:
            # Codeforces provides Unix timestamp which is always UTC
            start_dt_utc = datetime.fromtimestamp(c['startTimeSeconds'], tz=timezone.utc)
            start_time = start_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            if 'durationSeconds' in c:
                end_dt_utc = start_dt_utc + timedelta(seconds=c['durationSeconds'])
                end_time = end_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
                
        # 3. Classification
        event_type = "contest"
        tags = ["competitive-programming"]
        if c.get("type"): # e.g. CF, ICPC, IOI
            tags.append(c.get("type").lower())
            
        # 4. Mode & Location
        is_online = True
        city = c.get("city", None)
        country = c.get("country", None)
        
        # 5. Core Links
        if is_gym:
            url = f"https://codeforces.com/gym/{c['id']}"
        else:
            url = f"https://codeforces.com/contest/{c['id']}"
            
        # 6. Basic Access Info
        is_free = True
        price = None
        currency = None
        
        # 7. Status
        status = get_status(c.get("phase"))
        
        # Build Universal Event Object
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
                "source": "codeforces_api",
                "phase": c.get("phase"),
                "is_gym": is_gym,
                "duration_seconds": c.get("durationSeconds"),
                "relative_time_seconds": c.get("relativeTimeSeconds"),
            }
        }
        
        # Store all other possible Codeforces data in the `extra` field
        mapped_keys = {"id", "name", "startTimeSeconds", "durationSeconds", "phase", "city", "country", "type"}
        ignored_keys = {"relativeTimeSeconds", "frozen"}
        for k, v in c.items():
            if k not in mapped_keys and k not in ignored_keys:
                event_data["extra"][k] = v
                
        processed_contests.append(event_data)
        
    return processed_contests

def fetch_codeforces_contests():
    print("Fetching regular contests from Codeforces with continuous retry...")
    base_url = "https://codeforces.com/api/contest.list"
    
    regular_contests = []
    gym_contests = []
    
    # Fetch regular contests
    try:
        while True:
            data = request_json_with_retry("GET", base_url)
            if data.get('status') == 'OK':
                break
            print(f"Failed to fetch regular contests. Comment: {data.get('comment')}. Retrying...")
            time.sleep(2)
        if data.get('status') == 'OK':
            regular_contests = process_contests(data.get('result', []), is_gym=False)
            print(f"Successfully fetched {len(regular_contests)} regular contests.")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching regular contests: {e}")

    # Codeforces API allows 1 request per 2 seconds
    print("Waiting 2 seconds to respect Codeforces API rate limits...")
    time.sleep(2)
    
    # Fetch gym contests
    print("Fetching gym contests from Codeforces...")
    try:
        while True:
            data = request_json_with_retry("GET", base_url, params={"gym": "true"})
            if data.get('status') == 'OK':
                break
            print(f"Failed to fetch gym contests. Comment: {data.get('comment')}. Retrying...")
            time.sleep(2)
        if data.get('status') == 'OK':
            gym_contests = process_contests(data.get('result', []), is_gym=True)
            print(f"Successfully fetched {len(gym_contests)} gym contests.")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching gym contests: {e}")

    # Combine all results in a flat array (as typically used for events) or wrap them
    all_contests = regular_contests + gym_contests

    # Save to JSON file
    output_file = "codeforces_contests.json"
    print(f"Saving {len(all_contests)} events to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_contests, f, ensure_ascii=False, indent=4)
        
    print(f"All contest data successfully saved to {output_file}!")

if __name__ == "__main__":
    fetch_codeforces_contests()
