#!/usr/bin/env python3
"""
Seed the cities and states tables in Supabase with all POPULAR_CITIES
and ACTIVE_REGIONS. Ensures every city from the constants has a DB entry
so they appear in Google import sections and admin UIs.
"""

import json
import os
import urllib.request

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://vcvvtklbyvdbysfdbnfp.supabase.co")
SERVICE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY", "")

REGIONS = [
    {"name": "England", "slug": "england", "abbreviation": "ENG", "country_code": "GB", "display_order": 0},
    {"name": "Scotland", "slug": "scotland", "abbreviation": "SCT", "country_code": "GB", "display_order": 1},
    {"name": "Wales", "slug": "wales", "abbreviation": "WLS", "country_code": "GB", "display_order": 2},
    {"name": "Northern Ireland", "slug": "northern-ireland", "abbreviation": "NIR", "country_code": "GB", "display_order": 3},
]

CITIES = [
    {"name": "London", "slug": "london", "region": "england"},
    {"name": "Birmingham", "slug": "birmingham", "region": "england"},
    {"name": "Manchester", "slug": "manchester", "region": "england"},
    {"name": "Leeds", "slug": "leeds", "region": "england"},
    {"name": "Liverpool", "slug": "liverpool", "region": "england"},
    {"name": "Bristol", "slug": "bristol", "region": "england"},
    {"name": "Sheffield", "slug": "sheffield", "region": "england"},
    {"name": "Newcastle", "slug": "newcastle", "region": "england"},
    {"name": "Nottingham", "slug": "nottingham", "region": "england"},
    {"name": "Southampton", "slug": "southampton", "region": "england"},
    {"name": "Oxford", "slug": "oxford", "region": "england"},
    {"name": "Cambridge", "slug": "cambridge", "region": "england"},
    {"name": "Brighton", "slug": "brighton", "region": "england"},
    {"name": "Leicester", "slug": "leicester", "region": "england"},
    {"name": "Coventry", "slug": "coventry", "region": "england"},
    {"name": "Plymouth", "slug": "plymouth", "region": "england"},
    {"name": "Reading", "slug": "reading", "region": "england"},
    {"name": "Norwich", "slug": "norwich", "region": "england"},
    {"name": "Derby", "slug": "derby", "region": "england"},
    {"name": "Hull", "slug": "hull", "region": "england"},
    {"name": "Portsmouth", "slug": "portsmouth", "region": "england"},
    {"name": "Luton", "slug": "luton", "region": "england"},
    {"name": "Milton Keynes", "slug": "milton-keynes", "region": "england"},
    {"name": "Wolverhampton", "slug": "wolverhampton", "region": "england"},
    {"name": "Sunderland", "slug": "sunderland", "region": "england"},
    {"name": "Walsall", "slug": "walsall", "region": "england"},
    {"name": "Oldham", "slug": "oldham", "region": "england"},
    {"name": "Wigan", "slug": "wigan", "region": "england"},
    {"name": "Stoke-on-Trent", "slug": "stoke-on-trent", "region": "england"},
    {"name": "Warrington", "slug": "warrington", "region": "england"},
    {"name": "Bradford", "slug": "bradford", "region": "england"},
    {"name": "York", "slug": "york", "region": "england"},
    {"name": "Salford", "slug": "salford", "region": "england"},
    {"name": "Blackpool", "slug": "blackpool", "region": "england"},
    {"name": "Exeter", "slug": "exeter", "region": "england"},
    {"name": "Colchester", "slug": "colchester", "region": "england"},
    {"name": "Chelmsford", "slug": "chelmsford", "region": "england"},
    {"name": "Maidstone", "slug": "maidstone", "region": "england"},
    {"name": "Glasgow", "slug": "glasgow", "region": "scotland"},
    {"name": "Edinburgh", "slug": "edinburgh", "region": "scotland"},
    {"name": "Aberdeen", "slug": "aberdeen", "region": "scotland"},
    {"name": "Dundee", "slug": "dundee", "region": "scotland"},
    {"name": "Inverness", "slug": "inverness", "region": "scotland"},
    {"name": "Stirling", "slug": "stirling", "region": "scotland"},
    {"name": "Paisley", "slug": "paisley", "region": "scotland"},
    {"name": "Cardiff", "slug": "cardiff", "region": "wales"},
    {"name": "Swansea", "slug": "swansea", "region": "wales"},
    {"name": "Newport", "slug": "newport", "region": "wales"},
    {"name": "Wrexham", "slug": "wrexham", "region": "wales"},
    {"name": "Barry", "slug": "barry", "region": "wales"},
    {"name": "Belfast", "slug": "belfast", "region": "northern-ireland"},
    {"name": "Derry", "slug": "derry", "region": "northern-ireland"},
    {"name": "Lisburn", "slug": "lisburn", "region": "northern-ireland"},
    {"name": "Newry", "slug": "newry", "region": "northern-ireland"},
]

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}


def supabase_request(method, table, data=None):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode()) if resp.status == 200 else None


def seed_states():
    print("Seeding states/regions...")
    count = 0
    for region in REGIONS:
        try:
            supabase_request("POST", "states", region)
            print(f"  ✓ {region['name']}")
            count += 1
        except Exception as e:
            print(f"  ✗ {region['name']}: {e}")
    return count


def seed_cities():
    print("\nSeeding cities...")
    # Build state_id lookup
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/states?select=id,slug",
            headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}
        )
        with urllib.request.urlopen(req) as resp:
            states_data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"  ✗ Could not fetch states: {e}")
        return 0

    state_map = {s["slug"]: s["id"] for s in states_data}

    count = 0
    for city in CITIES:
        state_id = state_map.get(city["region"])
        if not state_id:
            print(f"  ✗ {city['name']}: no state_id for region {city['region']}")
            continue
        record = {
            "name": city["name"],
            "slug": city["slug"],
            "state_id": state_id,
            "country": "GB",
            "is_active": True,
        }
        try:
            supabase_request("POST", "cities", record)
            print(f"  ✓ {city['name']}")
            count += 1
        except Exception as e:
            print(f"  ✗ {city['name']}: {e}")
    return count


def seed_seo_pages():
    print("\nSeeding SEO pages for all cities...")
    count = 0
    for city in CITIES:
        slug = f"{city['region']}/{city['slug']}"
        record = {
            "slug": slug,
            "page_type": "city",
            "title": f"Fostering Agencies in {city['name']}",
            "h1": f"Fostering Agencies in {city['name']}",
            "is_indexed": True,
            "is_thin_content": True,
            "needs_optimization": True,
        }
        try:
            supabase_request("POST", "seo_pages", record)
            print(f"  ✓ {slug}")
            count += 1
        except Exception as e:
            print(f"  ✗ {slug}: {e}")
    return count


def main():
    if not SERVICE_KEY:
        print("ERROR: VITE_SUPABASE_SERVICE_ROLE_KEY not set.")
        print("Run with: VITE_SUPABASE_SERVICE_ROLE_KEY=your_key python3 seed_cities.py")
        return

    print("=== Seeding Database with All Cities ===")
    state_count = seed_states()
    city_count = seed_cities()
    page_count = seed_seo_pages()
    print(f"\nDone: {state_count} states, {city_count} cities, {page_count} SEO pages")


if __name__ == "__main__":
    main()
