"""Source -> channel and location -> region rules for the IMKAT dashboard.

The rules are ordered: first match wins. They were built from the ~990 distinct
`source` values found on Lead/Sales Pipeline opportunities and their contacts.
Anything that doesn't match a rule is reported as "Other" and listed on the Data
Health page so new spellings can be added here. Nothing is guessed.
"""
import re
from urllib.parse import urlparse, parse_qs

UNATTRIBUTED = "Unattributed"

# (channel, regex) evaluated against the lower-cased, whitespace-collapsed source.
CHANNEL_RULES = [
    ("Phone (inbound)",        r"\bphone\b|call main"),
    ("Google Business Profile", r"\bgmb\b|google my bu"),
    ("Organic Social",         r"organic bio|facebook bio|\bbio\b"),
    ("Organic / SEO",          r"organic|chatgpt|not tracked"),
    ("Meta Ads",               r"facebook|\bfb\b|fb[-_]|\bmeta\b|metaads|\big\b|ig[-_]|instagram|^an\b|\ban \d|audience network"),
    ("Google Ads",             r"google[- ]?ads|google (sacramento|bay|san|solano|east|fremont)|main form - google"),
    ("YouTube Ads",            r"youtube"),
    ("Nextdoor",               r"next ?door"),
    ("Referral",               r"referr|refferal|friend|old customer"),
    ("Events",                 r"open house|seminar|webinar|expo|adu tour|private adu tour|meet and greet"),
    ("TV",                     r"\btv\b|tvads|peacock"),
    ("Offline / Other",        r"door hanger|self gen|billboard|radio"),
    ("Website (no source)",    r"involve\.me|interactive floorplans|imkatconstruction\.com"),
    ("5K Promo (channel unknown)", r"5k popup"),
]


def _norm(s):
    if not isinstance(s, str):
        return ""
    return re.sub(r"\s+", " ", s.strip().lower())


def utm_from_url(s):
    """Return utm_source/campaign/content from a landing-page URL, else None."""
    if not isinstance(s, str) or "utm_" not in s:
        return None
    q = parse_qs(urlparse(s.strip()).query)
    return {k: q.get(f"utm_{k}", [None])[0] for k in ("source", "campaign", "content", "medium")}


def channel(source):
    """Map a raw GHL source string (or landing URL) to a reporting channel."""
    s = _norm(source)
    if not s:
        return UNATTRIBUTED
    utm = utm_from_url(s)
    if utm and utm["source"]:
        s = f"{utm['source']} {utm['campaign'] or ''}".strip()
    for name, rx in CHANNEL_RULES:
        if re.search(rx, s):
            return name
    return "Other"


def is_5k_promo(source):
    return "5k" in _norm(source)


# ---------------------------------------------------------------- region
BAY, SAC, OUTSIDE, UNKNOWN = "Bay Area", "Sacramento", "Outside core markets", "Unknown"

# Follows how the team already fills "Sacramento Or Bay Area" in GHL:
# Solano County (Vacaville/Fairfield/Vallejo/Benicia) = Bay Area; Davis/Dixon = Sacramento.
ZIP_OVERRIDES = {"95687": BAY, "95688": BAY, "95696": BAY, "95620": SAC, "95616": SAC, "95618": SAC}


def region_from_zip(z):
    if not z:
        return None
    if z in ZIP_OVERRIDES:
        return ZIP_OVERRIDES[z]
    p = int(z[:3])
    if 940 <= p <= 951 or p == 954:
        return BAY
    if 956 <= p <= 959:
        return SAC
    if p in (952, 953):          # Stockton / Modesto / Central Valley
        return OUTSIDE
    return OUTSIDE if z.startswith("9") else None


def zip_from_text(s):
    m = re.findall(r"\b(9\d{4})\b", s) if isinstance(s, str) else []
    return m[-1] if m else None


def region_from_source(source):
    s = _norm(source)
    if re.search(r"bay|san[- +]?jose|east[- ]?bay|contra|solano|fremont|alameda|sonoma|north bay", s):
        return BAY
    if re.search(r"sacramento|\bsac\b|roseville|elk grove|folsom", s):
        return SAC
    return None


SAC_AREA_CODES = {"916", "279", "530"}
BAY_AREA_CODES = {"408", "415", "510", "650", "707", "925", "628", "669", "341", "831"}


def region_from_phone(phone):
    """Weakest signal: 84% agreement with known regions in the audit (Bay Area
    numbers often own Sacramento properties). Always labeled as an estimate."""
    digits = re.sub(r"\D", "", phone) if isinstance(phone, str) else ""
    ac = digits[-10:][:3] if len(digits) >= 10 else ""
    if ac in SAC_AREA_CODES:
        return SAC
    if ac in BAY_AREA_CODES:
        return BAY
    if ac == "209":
        return OUTSIDE
    return None


def region(field_value=None, address=None, contact_zip=None, source=None, phone=None):
    """Priority: GHL region field -> property-address ZIP -> contact ZIP ->
    campaign name -> phone area code (estimate)."""
    if field_value in (BAY, SAC):
        return field_value, "GHL field"
    r = region_from_zip(zip_from_text(address))
    if r:
        return r, "Property address"
    r = region_from_zip(contact_zip if isinstance(contact_zip, str) and len(contact_zip) >= 5 else None)
    if r:
        return r, "Contact ZIP"
    r = region_from_source(source)
    if r:
        return r, "Campaign name"
    r = region_from_phone(phone)
    if r:
        return r, "Phone area code (est.)"
    return UNKNOWN, "None"
