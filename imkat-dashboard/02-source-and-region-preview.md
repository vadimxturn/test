# Source & Region Preview: 2026 YTD (Jan 1 – Sep 22)

Scope: Lead Pipeline + Sales Pipeline. Appointments = walkthroughs that weren't cancelled, for David, James, Eugene and Avenir.
Rules are in `etl/mapping.py`. ⚠️ = low confidence (fewer than 10 wins or 10 appointments).

**Definitions**
- **Lead**: a contact whose first Lead/Sales deal *or* first walkthrough booking falls in the period. *Qualified* excludes Fake/Spam, Outside Service and No Property.
- **Source**: the lead's *original* source (the earliest source on any of their deals, then the contact's source / landing-page UTM). Spend and credit follow the original source, not the last touch.
- **Close rate** = deals won in the period ÷ appointments in the period (activity view). **Win rate** = won ÷ (won + lost).
- **Ready to sign** = open Sales deals in estimate-delivered stages (see `01-data-audit.md` §2a).

## By source

| Source | Leads (qual.) | Appts | Lead→Appt | Won | Revenue | Close rate | Win rate | Ready to sign |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Organic / SEO | 390 | 118 | 30.3% | 37 | $10.01M | 31.4% | 38.1% | $7.92M |
| **Unattributed** | 477 | 197 | – | 38 | $9.71M | 19.3% | 26.2% | $18.22M |
| Meta Ads | 1,529 | 189 | 12.4% | 26 | $7.51M | 13.8% | 26.3% | $16.59M |
| Google Ads ⚠️ | 222 | 64 | 28.8% | 9 | $2.23M | 14.1% | 25.0% | $2.73M |
| Events ⚠️ | 9 | 5 | – | 8 | $2.03M | – | 57.1% | $0.78M |
| Website, no UTM ⚠️ | 46 | 45 | – | 3 | $0.94M | 6.7% | 50.0% | $0.35M |
| Organic Social ⚠️ | 47 | 9 | 19.1% | 3 | $0.62M | – | 37.5% | $0.32M |
| Google Business Profile ⚠️ | 62 | 26 | 41.9% | 2 | $0.58M | 7.7% | 18.2% | $2.65M |
| Other (5K promo, TV, referral, phone, YouTube, Nextdoor) ⚠️ | 8 | 2 | – | 1 | $0.21M | – | – | $1.04M |
| **Total** | **2,790** | **655** | 23.5% | **127** | **$33.82M** | 19.4% | 30.2% | $50.58M |

Events show 8 wins against 5 appointments because those wins came from walkthroughs held in 2025. Their close rate is left blank, and the cohort view will fix this.

## By region

| Region | Leads (qual.) | Appts | Lead→Appt | Won | Revenue | Close rate | Win rate | Lost | Ready to sign |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Bay Area** | 1,300 | 301 | 23.2% | 60 | **$17.23M** | 19.9% | **34.1%** | 116 | **$28.66M** |
| **Sacramento** | 1,242 | 327 | 26.3% | 63 | $15.62M | 19.3% | 27.2% | 169 | $21.33M |
| Outside core markets ⚠️ | 109 | 21 | – | 4 | $0.97M | – | 40.0% | 6 | $0.42M |
| Unknown | 139 | 6 | – | 0 | – | – | – | 3 | $0.18M |

**How the region was determined:** 109 of the 127 wins come from GHL's "Sacramento Or Bay Area" field and 17 from the property address, so the won/revenue split is solid. For leads, 21% of regions come from the phone area code, which is an estimate with 84% accuracy in testing, and 8% are unknown.

## Source × region (rows with volume)

| Source | Region | Leads (qual.) | Appts | Lead→Appt | Won | Revenue | Close rate |
|---|---|---:|---:|---:|---:|---:|---:|
| Meta Ads | Bay Area | 774 | 110 | 14.2% | 11 | $3.46M | 10.0% |
| Meta Ads | Sacramento | 697 | 67 | 9.6% | 13 | $3.56M | 19.4% |
| Google Ads | Sacramento | 159 | 55 | 34.6% | 5 ⚠️ | $1.12M | 9.1% ⚠️ |
| Google Ads | Bay Area | 60 | 9 ⚠️ | 15.0% | 4 ⚠️ | $1.12M | – |
| Organic / SEO | Bay Area | 181 | 50 | 27.6% | 18 | $5.27M | 36.0% |
| Organic / SEO | Sacramento | 138 | 66 | 47.8% | 18 | $4.42M | 27.3% |
| Unattributed | Bay Area | 205 | 90 | – | 18 | $4.96M | 20.0% |
| Unattributed | Sacramento | 181 | 98 | – | 20 | $4.74M | 20.4% |

## Rep × region

| Rep | Bay Area appts → won | Bay close | Sacramento appts → won | Sac close |
|---|---|---:|---|---:|
| David | 74 → 19 ($5.91M) | 25.7% | 80 → 19 ($4.75M) | 23.8% |
| Avenir | 77 → 17 ($4.75M) | 22.1% | 92 → 20 ($5.19M) | 21.7% |
| Eugene | 69 → 14 ($3.69M) | 20.3% | 71 → 14 ($3.60M) | 19.7% |
| James | 81 → 9 ($2.59M) | 11.1% | 84 → 7 ($1.70M) | 8.3% |

## Caveats
- **30% of 2026 wins ($9.7M) are Unattributed.** Their deals and contacts have no source at all. They get their own row and are never spread across the other channels.
- "Organic / SEO" is one bucket. GHL can't tell SEO city pages apart from word of mouth or returning leads.
- Meta leads include Instagram and Audience Network. Google Ads includes the Sacramento / Solano / East Bay / San Jose campaigns. Cost per lead / appointment / win needs the Google Ads and Meta APIs.
- Solano County (Vacaville, Fairfield, Vallejo, Benicia) counts as **Bay Area**, following how the team already fills in GHL. Stockton / Modesto / Central Valley = "Outside core markets".
