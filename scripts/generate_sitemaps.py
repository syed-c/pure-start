#!/usr/bin/env python3
"""
Comprehensive sitemap generator for foster-care.co.uk.
Fetches all SEO pages from Supabase, includes ALL known routes,
and generates proper sitemaps for Google Search Console.
"""

import json
import urllib.request
import os
from datetime import date
from xml.sax.saxutils import escape

BASE_URL = "https://www.foster-care.co.uk"
TODAY = date.today().isoformat()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://vcvvtklbyvdbysfdbnfp.supabase.co")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "")

# === CONSTANTS (mirrored from activeRegions.ts) ===

REGIONS = ["england", "scotland", "wales", "northern-ireland"]

FOSTERING_CATEGORIES = [
    "independent-fostering-agency", "local-authority-fostering",
    "emergency-fostering", "short-term-fostering", "long-term-fostering",
    "respite-fostering", "parent-and-child-fostering", "therapeutic-fostering",
    "sibling-fostering", "teenage-fostering", "disability-complex-needs-fostering",
    "kinship-fostering", "remand-fostering", "specialist-fostering", "uasc-fostering",
]

POPULAR_CITIES = [
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

TEMPLATE_CITIES = [
    "london", "manchester", "birmingham", "leeds", "liverpool",
    "bristol", "sheffield", "glasgow", "cardiff", "newcastle", "edinburgh",
]


def fetch_supabase(table, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def url_tag(path, freq="weekly", priority="0.7"):
    return f"  <url><loc>{BASE_URL}{path}</loc><changefreq>{freq}</changefreq><priority>{priority}</priority></url>"


def write_sitemap(filename, urls):
    with open(f"public/{filename}", "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls:
            f.write(u + "\n")
        f.write("</urlset>\n")
    print(f"  ✓ {filename}: {len(urls)} URLs")


def write_index(sitemaps):
    with open("public/sitemap.xml", "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for name in sitemaps:
            f.write(f'  <sitemap>\n    <loc>{BASE_URL}/{name}</loc>\n    <lastmod>{TODAY}</lastmod>\n  </sitemap>\n')
        f.write("</sitemapindex>\n")
    print(f"  ✓ sitemap.xml (index): {len(sitemaps)} sub-sitemaps")


def generate_static():
    urls = [
        url_tag("/", "daily", "1.0"),
        url_tag("/fostering-agencies/", "daily", "0.9"),
        url_tag("/search", "daily", "0.8"),
        url_tag("/become-foster-carer/", "weekly", "0.8"),
        url_tag("/how-it-works/", "weekly", "0.8"),
        url_tag("/about/", "monthly", "0.7"),
        url_tag("/contact/", "monthly", "0.7"),
        url_tag("/faq/", "monthly", "0.7"),
        url_tag("/blog/", "daily", "0.8"),
        url_tag("/resources/", "weekly", "0.7"),
        url_tag("/categories/", "weekly", "0.8"),
        url_tag("/services/", "weekly", "0.8"),
        url_tag("/privacy/", "monthly", "0.3"),
        url_tag("/terms/", "monthly", "0.3"),
        url_tag("/verification-policy/", "monthly", "0.3"),
        url_tag("/editorial-policy/", "monthly", "0.3"),
        url_tag("/medical-review-policy/", "monthly", "0.3"),
        url_tag("/pricing/", "monthly", "0.3"),
        url_tag("/sitemap/", "monthly", "0.3"),
        url_tag("/list-your-agency/", "weekly", "0.8"),
        url_tag("/claim-profile/", "weekly", "0.7"),
        url_tag("/locations/", "weekly", "0.7"),
        url_tag("/emergency-fostering/", "weekly", "0.8"),
        url_tag("/tools/fostering-allowance-calculator/", "monthly", "0.5"),
        url_tag("/tools/insurance-checker/", "monthly", "0.5"),
        url_tag("/compare/ifa-vs-local-authority/", "monthly", "0.6"),
    ]

    # Region landing pages (top-level)
    for region in REGIONS:
        urls.append(url_tag(f"/{region}/", "weekly", "0.8"))

    # Nation directory pages
    for region in REGIONS:
        urls.append(url_tag(f"/fostering-agencies/{region}/", "weekly", "0.8"))

    # Template city landing pages (top-level, before catch-all)
    for city in TEMPLATE_CITIES:
        urls.append(url_tag(f"/{city}/", "weekly", "0.8"))

    write_sitemap("sitemap-static.xml", urls)


def generate_categories():
    urls = []
    for cat in FOSTERING_CATEGORIES:
        urls.append(url_tag(f"/categories/{cat}/", "weekly", "0.7"))
    write_sitemap("sitemap-categories.xml", urls)


def generate_cities(db_cities_region, db_cities_fostering):
    urls = []
    seen = set()

    # Region/city format: /{region}/{city}/ — canonical city landing pages
    # Use POPULAR_CITIES as the canonical set
    for city in POPULAR_CITIES:
        key = f"/{city['region']}/{city['slug']}/"
        if key not in seen:
            urls.append(url_tag(key, "weekly", "0.7"))
            seen.add(key)

    # Fostering-agencies format: /fostering-agencies/{city}/
    # Include ALL cities from DB + POPULAR_CITIES
    seen_fa = set()
    for slug in db_cities_fostering:
        place = slug.replace("fostering-agencies/", "")
        if place not in seen_fa:
            urls.append(url_tag(f"/fostering-agencies/{place}/", "weekly", "0.7"))
            seen_fa.add(place)
    for city in POPULAR_CITIES:
        if city["slug"] not in seen_fa:
            urls.append(url_tag(f"/fostering-agencies/{city['slug']}/", "weekly", "0.7"))
            seen_fa.add(city["slug"])

    write_sitemap("sitemap-cities.xml", urls)


def generate_city_categories(db_city_categories):
    urls = []
    seen = set()

    # From DB
    for slug in db_city_categories:
        key = f"/{slug}/"
        if key not in seen:
            urls.append(url_tag(key, "weekly", "0.7"))
            seen.add(key)

    # ALL POPULAR_CITIES x ALL 15 services
    for city in POPULAR_CITIES:
        for cat in FOSTERING_CATEGORIES:
            key = f"/{city['region']}/{city['slug']}/{cat}/"
            if key not in seen:
                urls.append(url_tag(key, "weekly", "0.6"))
                seen.add(key)

    write_sitemap("sitemap-city-categories.xml", urls)


def generate_fostering_service_locations(db_cities_fostering):
    urls = []
    seen = set()

    # Nations x ALL 15 services
    for region in REGIONS:
        for cat in FOSTERING_CATEGORIES:
            key = f"/fostering-agencies/{region}/{cat}/"
            if key not in seen:
                urls.append(url_tag(key, "weekly", "0.7"))
                seen.add(key)

    # All fostering-agencies cities x ALL 15 services
    fa_cities = set()
    for slug in db_cities_fostering:
        fa_cities.add(slug.replace("fostering-agencies/", ""))
    for city in POPULAR_CITIES:
        fa_cities.add(city["slug"])

    for place in sorted(fa_cities):
        for cat in FOSTERING_CATEGORIES:
            key = f"/fostering-agencies/{place}/{cat}/"
            if key not in seen:
                urls.append(url_tag(key, "weekly", "0.6"))
                seen.add(key)

    write_sitemap("sitemap-fostering-service-location.xml", urls)


def generate_agencies():
    """Fetch agencies from Supabase and generate static sitemap."""
    urls = []
    try:
        agencies = fetch_supabase("agencies", "select=slug&is_active=eq.true&limit=1000")
        for agency in agencies:
            slug = agency.get("slug", "")
            if slug:
                urls.append(url_tag(f"/agency/{slug}/", "weekly", "0.6"))
        print(f"  Fetched {len(agencies)} active agencies from DB")
    except Exception as e:
        print(f"  ⚠ Agency fetch failed: {e}")
    write_sitemap("sitemap-agencies.xml", urls)


def generate_blog():
    urls = []
    try:
        posts = fetch_supabase("blog_posts", "select=slug&status=eq.published&limit=1000")
        for post in posts:
            slug = post.get("slug", "")
            if slug:
                urls.append(url_tag(f"/blog/{slug}/", "monthly", "0.6"))
    except Exception as e:
        print(f"  ⚠ Blog fetch failed: {e}")
    write_sitemap("sitemap-blog.xml", urls)


def main():
    print("Fetching DB pages from Supabase...")
    db_pages = {}
    try:
        pages = fetch_supabase("seo_pages", "select=slug,page_type&limit=5000")
        for p in pages:
            t = p.get("page_type", "")
            if t not in db_pages:
                db_pages[t] = []
            db_pages[t].append(p["slug"])
        print(f"  Fetched {len(pages)} pages from seo_pages")
    except Exception as e:
        print(f"  ⚠ Supabase fetch failed: {e}")
        db_pages = {}

    db_cities_region = [s for s in db_pages.get("city", []) if not s.startswith("fostering-agencies/")]
    db_cities_fostering = [s for s in db_pages.get("city", []) if s.startswith("fostering-agencies/")]
    db_city_categories = db_pages.get("city_category", [])

    print("\nGenerating sitemaps...")
    generate_static()
    generate_categories()
    generate_cities(db_cities_region, db_cities_fostering)
    generate_city_categories(db_city_categories)
    generate_fostering_service_locations(db_cities_fostering)
    generate_agencies()
    generate_blog()

    write_index([
        "sitemap-static.xml",
        "sitemap-categories.xml",
        "sitemap-cities.xml",
        "sitemap-city-categories.xml",
        "sitemap-fostering-service-location.xml",
        "sitemap-agencies.xml",
        "sitemap-blog.xml",
    ])

    print("\nDone! Sitemaps generated in public/")


if __name__ == "__main__":
    main()
