import requests
import json
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup
import time

from scappers.scraper_utils import merge_unique_events, request_text_with_retry

def process_atcoder_contests(html_content, status):
    processed = []
    soup = BeautifulSoup(html_content, 'html.parser')
    
    table = soup.find('div', id=f'contest-table-{status}')
    if not table:
        table = soup.find('table')
        if not table:
            return processed
            
    rows = table.find('tbody').find_all('tr') if table.find('tbody') else []
    for row in rows:
        cols = row.find_all('td')
        if len(cols) < 2:
            continue
            
        time_a = cols[0].find('a')
        start_time_raw = time_a.text.strip() if time_a else cols[0].text.strip()
        start_time = None
        end_time = None
        try:
            dt = datetime.strptime(start_time_raw, "%Y-%m-%d %H:%M:%S%z")
            start_dt_utc = dt.astimezone(timezone.utc)
            start_time = start_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            duration_str = cols[2].text.strip()
            h, m = map(int, duration_str.split(':'))
            end_dt_utc = start_dt_utc + timedelta(hours=h, minutes=m)
            end_time = end_dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception:
            pass
            
        contest_a = cols[1].find('a')
        title = contest_a.text.strip() if contest_a else cols[1].text.strip()
        platform = "atcoder"
        external_id = contest_a['href'].split('/')[-1] if contest_a else ""
        url = f"https://atcoder.jp{contest_a['href']}" if contest_a else ""
        
        rated_range = cols[3].text.strip() if len(cols) > 3 else ""
        if rated_range.startswith("~"):
            rated_range = rated_range.replace("~", "-")
            
        if rated_range.startswith("- "):
            rated_range = "0 - " + rated_range[2:]
        elif rated_range.startswith("-"):
            rated_range = "0 - " + rated_range[1:]
            
        if rated_range.endswith(" -"):
            rated_range = rated_range[:-2] + " - Infinity"
        elif rated_range.endswith("-"):
            rated_range = rated_range[:-1] + " - Infinity"
            
        if rated_range == "All":
            rated_range = "0 - Infinity"
            
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
            "url": url,
            "is_free": True,
            "price": None,
            "currency": None,
            "status": "past" if status in ["recent", "archive"] else status,
            "extra": {
                "rated_range": rated_range
            }
        }
        processed.append(event_data)
        
    return processed

def fetch_atcoder():
    print("Fetching active contests from AtCoder via scraping...")
    headers = {"User-Agent": "Mozilla/5.0"}
    all_events = []
    
    try:
        response_text = request_text_with_retry("https://atcoder.jp/contests/", headers=headers)
        upcoming = process_atcoder_contests(response_text, "upcoming")
        action = process_atcoder_contests(response_text, "action") # action = ongoing
        for e in action:
            e["status"] = "ongoing"
        merge_unique_events(all_events, upcoming)
        merge_unique_events(all_events, action)
        
        print("Fetching past contests archive (Paginated)...")
        page = 1
        while True:
            archive_url = f"https://atcoder.jp/contests/archive?page={page}"
            resp_text = request_text_with_retry(archive_url, headers=headers)
            past_events = process_atcoder_contests(resp_text, "archive")
            added_events = merge_unique_events(all_events, past_events)
            if not added_events:
                break
            page += 1
            time.sleep(0.5) 
            
    except Exception as e:
        print(f"Error fetching AtCoder: {e}")
        
    print(f"Fetched {len(all_events)} contests from AtCoder.")
    with open("atcoder_scraper_results.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)
    print("Saved to atcoder_scraper_results.json")

if __name__ == "__main__":
    fetch_atcoder()
