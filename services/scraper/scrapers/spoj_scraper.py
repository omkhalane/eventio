import requests
import json
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup
import time
import re

from services.scraper.scraper_utils import merge_unique_events, request_text_with_retry


def parse_spoj_datetime(date_str: str):
    """Parse SPOJ date strings like 'Apr/29/2026' or similar."""
    if not date_str or date_str.strip() in ['', '-', 'N/A']:
        return None
    
    try:
        # Try common SPOJ formats: Apr/29/2026, Apr 29 2026, etc.
        for fmt in ['%b/%d/%Y', '%b %d %Y', '%B %d %Y', '%b/%d/%Y %H:%M', '%Y-%m-%d']:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                dt = dt.replace(tzinfo=timezone.utc)
                return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            except ValueError:
                continue
    except Exception:
        pass
    return None


def process_spoj_contests(html_content: str) -> list:
    """Parse SPOJ contests from the contest table."""
    processed = []
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the main contests table
    tables = soup.find_all('table')
    if not tables:
        return processed
    
    # Look for a table with contest data (usually the second or main one)
    for table in tables:
        rows = table.find_all('tr')
        if len(rows) < 2:
            continue
        
        # Check if this looks like a contest table (has relevant headers)
        header_row = rows[0]
        header_text = header_row.get_text().lower()
        if 'contest' not in header_text and 'start' not in header_text and 'end' not in header_text:
            continue
        
        # Process each row
        for row in rows[1:]:
            try:
                cols = row.find_all(['td', 'th'])
                if len(cols) < 2:
                    continue
                
                # Extract contest name/title (usually first column)
                title_cell = cols[0]
                title_link = title_cell.find('a')
                if title_link:
                    title = title_link.get_text(strip=True)
                    url_part = title_link.get('href', '')
                    external_id = url_part.split('/')[-1] if '/' in url_part else title
                else:
                    title = title_cell.get_text(strip=True)
                    external_id = title
                
                if not title or len(title) < 2:
                    continue
                
                # Build full URL
                url = f"https://www.spoj.com{url_part}" if url_part.startswith('/') else url_part
                if not url.startswith('http'):
                    url = f"https://www.spoj.com/contests/{title}"
                
                # Extract dates from columns
                start_time = None
                end_time = None
                status = "upcoming"
                
                # Try to parse date columns (typically columns 1-2 or later)
                for i, col in enumerate(cols[1:], 1):
                    col_text = col.get_text(strip=True)
                    # Look for date patterns
                    if re.search(r'\d+/\d+/\d+|\d+-\d+-\d+', col_text):
                        if i == 1 or 'start' in header_text.split()[i-1:i]:
                            start_time = parse_spoj_datetime(col_text)
                        elif i == 2 or 'end' in header_text.split()[i-1:i]:
                            end_time = parse_spoj_datetime(col_text)
                
                # Determine status based on dates
                now = datetime.now(timezone.utc)
                if start_time:
                    start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    if now < start_dt:
                        status = "upcoming"
                    else:
                        status = "ongoing"
                
                if end_time:
                    end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                    if now > end_dt:
                        status = "past"
                
                event_data = {
                    "title": title,
                    "platform": "spoj",
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
                    "status": status,
                    "extra": {}
                }
                processed.append(event_data)
            except Exception:
                continue
    
    return processed


def fetch_spoj():
    print("Fetching contests from SPOJ (Paginated, retrying until exhausted)...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    all_events = []
    page = 1
    
    try:
        while True:
            # SPOJ typically uses ?start=<offset> or ?page=<n>
            url = f"https://www.spoj.com/contests/?start={(page - 1) * 20}"
            try:
                response_text = request_text_with_retry(url, headers=headers, max_attempts=3)
                batch = process_spoj_contests(response_text)
                added_events = merge_unique_events(all_events, batch)
                if not added_events:
                    break
            except Exception as e:
                if "403" in str(e) or "Forbidden" in str(e):
                    print(f"SPOJ is blocking requests (403 Forbidden). Stopping scraper.")
                    break
                raise
            
            page += 1
            time.sleep(0.5)
            
    except Exception as e:
        print(f"Error fetching SPOJ: {e}")
    
    print(f"Fetched {len(all_events)} contests from SPOJ.")
    with open("spoj_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)
    print("Saved to spoj_contests.json")


if __name__ == "__main__":
    fetch_spoj()
