import requests
import json
from datetime import datetime, timezone
from bs4 import BeautifulSoup
import time
import re
from typing import List, Optional

from scappers.scraper_utils import merge_unique_events, request_text_with_retry

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False


def parse_icpc_date(date_str: str) -> Optional[str]:
    """Parse ICPC date strings to ISO format. Handles formats like 'Nov 27, 26'"""
    if not date_str or date_str.strip() in ['', '-', 'N/A', 'TBD', 'Not specified']:
        return None
    
    date_str = date_str.strip()
    try:
        # Formats with year as 2-digit (26 = 2026, 27 = 2027)
        for fmt in ['%b %d, %y', '%b %d, %Y', '%d %b %y', '%d %b %Y', '%B %d, %y', '%B %d, %Y', '%m/%d/%y', '%m/%d/%Y']:
            try:
                dt = datetime.strptime(date_str, fmt)
                # Handle 2-digit years
                if dt.year < 100:
                    if dt.year < 50:
                        dt = dt.replace(year=dt.year + 2000)
                    else:
                        dt = dt.replace(year=dt.year + 1900)
                dt = dt.replace(tzinfo=timezone.utc)
                return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
            except ValueError:
                continue
    except Exception:
        pass
    return None


def process_icpc_regionals(text: str) -> List[dict]:
    """Parse ICPC regionals from plain text."""
    processed = []
    lines = text.split('\n')
    
    # Pattern to match lines with contest info
    # Format: "Contest Title  Nov 27, 26  Aug 31, 26 - Oct 31, 26"
    pattern = r'^(.+?)\s+([A-Z][a-z]{2}\s+\d+,\s*\d+|Not\s+specified)\s+(.+?)\s*-\s*(.+?)$'
    
    for line in lines:
        line = line.strip()
        if not line or 'Contest Date' in line or 'Registration' in line:
            continue
        
        match = re.match(pattern, line)
        if match:
            title = match.group(1).strip()
            contest_date = match.group(2).strip()
            reg_start_str = match.group(3).strip()
            reg_end_str = match.group(4).strip()
            
            # Only process if it has ICPC in the title
            if 'ICPC' not in title and 'icpc' not in title.lower():
                continue
            
            # Parse registration dates
            start_time = parse_icpc_date(reg_start_str)
            end_time = parse_icpc_date(reg_end_str)
            
            # Skip if no valid dates
            if not start_time or not end_time:
                continue
            
            # Skip if already added
            if any(e['title'] == title for e in processed):
                continue
            
            external_id = title.lower().replace(' ', '-').replace('&', 'and')[:80]
            
            # Determine status
            now = datetime.now(timezone.utc)
            status = "upcoming"
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if now > start_dt:
                status = "ongoing"
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            if now > end_dt:
                status = "past"
            
            event_data = {
                "title": title,
                "platform": "icpc",
                "external_id": external_id,
                "start_time": start_time,
                "end_time": end_time,
                "timezone": "UTC",
                "event_type": "contest",
                "tags": ["competitive-programming", "icpc", "collegiate", "regional"],
                "is_online": True,
                "city": None,
                "country": None,
                "url": "https://icpc.global/regionals/upcoming",
                "is_free": True,
                "price": None,
                "currency": None,
                "status": status,
                "extra": {
                    "contest_type": "ICPC Regional",
                    "contest_date": contest_date,
                    "registration_period": f"{reg_start_str} - {reg_end_str}"
                }
            }
            processed.append(event_data)
    
    return processed


def fetch_icpc_with_selenium() -> list:
    """Fetch ICPC regionals using Selenium."""
    print("Fetching ICPC regionals with Selenium...")
    all_events = []
    
    try:
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--headless')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('user-agent=Mozilla/5.0')
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        driver.get("https://icpc.global/regionals/upcoming")
        time.sleep(2)
        
        # Click all regional categories to expand
        try:
            elements_to_click = driver.find_elements(By.XPATH, "//*[contains(text(), 'ICPC') and contains(text(), 'Contests')]")
            print(f"Found {len(elements_to_click)} categories, expanding...")
            
            for elem in elements_to_click:
                try:
                    driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                    time.sleep(0.2)
                    driver.execute_script("arguments[0].click();", elem)
                    time.sleep(0.5)
                except:
                    pass
        except Exception as e:
            pass
        
        # Scroll to load all content
        for _ in range(10):
            driver.execute_script("window.scrollBy(0, window.innerHeight);")
            time.sleep(0.3)
        
        # Get page text
        text = driver.find_element(By.TAG_NAME, 'body').text
        driver.quit()
        
        all_events = process_icpc_regionals(text)
        print(f"Successfully extracted {len(all_events)} regionals from rendered page")
        
    except Exception as e:
        print(f"Selenium rendering failed: {e}")
        if 'driver' in locals():
            try:
                driver.quit()
            except:
                pass
    
    return all_events


def fetch_icpc_static() -> list:
    """Fallback: Fetch and parse static HTML."""
    print("Fetching ICPC regionals (static HTML)...")
    all_events = []
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        html_content = request_text_with_retry("https://icpc.global/regionals/upcoming", headers=headers, max_attempts=3)
        soup = BeautifulSoup(html_content, 'html.parser')
        text = soup.get_text()
        all_events = process_icpc_regionals(text)
    except Exception as e:
        print(f"Static fetch failed: {e}")
    
    return all_events


def fetch_icpc():
    print("Fetching contests from ICPC Regionals (Upcoming)...")
    all_events = []
    
    if SELENIUM_AVAILABLE:
        all_events = fetch_icpc_with_selenium()
    
    if not all_events:
        all_events = fetch_icpc_static()
    
    print(f"Fetched {len(all_events)} ICPC regionals with registration dates.")
    with open("icpc_contests.json", "w", encoding="utf-8") as f:
        json.dump(all_events, f, indent=4)
    print("Saved to icpc_contests.json")


if __name__ == "__main__":
    fetch_icpc()
