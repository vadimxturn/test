# IMKAT Homes Performance Dashboard: Step 1 Data Audit

Audit date: 2026-09-22 · GHL location `q19Ltm6yjlZZlJUuZayE`
Status: **GHL audited. Waiting on stage-mapping confirmation, Google Ads + Meta access. No KPIs calculated yet.**

Pulled live from the GHL API v2 (the full account, not a sample):

| Object | Records | Date range |
|---|---:|---|
| Contacts | 20,985 | Mar 2024 – today |
| Opportunities (9 pipelines) | 13,814 | Mar 2024 – today |
| Calendar appointments (11 calendars) | 2,886 unique | Apr 2024 – Nov 2026 (future bookings included) |
| Messages (SMS / call / voicemail / FB / IG) | 172,520 | Apr 2024 – today |
| Users | 29 | – |

Raw data stays in the session scratchpad and is **not** committed to the repo (it contains customer PII).

---

## 1. Pipelines and stages

There are 9 pipelines. Only **Sales Pipeline** carries deal values and win/loss statuses. The others are nurture or event lists.

| Pipeline | Opps | Open | Won | Lost | Has $ value | Role |
|---|---:|---:|---:|---:|---:|---|
| **Lead Pipeline** | 7,061 | 4,336 | 1 | 2,722 | 0% | Top of funnel: new leads + call cadence |
| **Sales Pipeline** | 2,137 | 823 | **476** | 763 (+75 abandoned) | 64% | Walkthrough → estimate → close |
| Open House | 3,260 | 3,259 | 0 | 1 | 0% | Event sign-ups |
| ADU Seminar | 650 | 650 | 0 | 0 | 0% | Seminar / webinar sign-ups |
| Inside Sales | 496 | 496 | 0 | 0 | 91% ($127M) | ⚠️ Separate estimate-follow-up pipeline. Only 1 contact overlaps with Sales Pipeline |
| Financing | 99 | 99 | 0 | 0 | 0% | Finance tracking |
| Business Development | 88 | 88 | 0 | 0 | 2% | B2B / partners |
| Imkat Referrers | 14 | – | – | – | – | Referral partners |
| Event Pipeline | 1 | – | – | – | – | Unused |
| *(deleted pipeline)* | 8 | – | – | – | – | Orphaned records, excluded |

### Sales Pipeline: current stage counts

| # | Stage (exact GHL name) | Open | Won | Lost | Value ($) |
|---|---|---:|---:|---:|---:|
| 0 | Walkthrough Scheduled | 105 | 0 | 2 | 0.65M |
| 1 | Unqualified Lead | 117 | 0 | 36 | 6.05M |
| 2 | Walkthrough Completed | 13 | 0 | 1 | 0 |
| 3 | Ready for Estimate (BT) | 5 | 0 | 0 | 0 |
| 4 | Estimate Needs Revision | 6 | 0 | 0 | 1.68M |
| 5 | Estimate Ready (Sales) | 36 | 0 | 2 | 10.73M |
| 6 | In-Bound Calls | 0 | 0 | 0 | 0.27M |
| 7 | Proposal Sent to Client | 7 | 0 | 0 | 2.02M |
| 8 | Contact Made/ Pending | 25 | 0 | 1 | 8.76M |
| 9 | Review W/Decision Makers | 33 | 0 | 0 | 9.00M |
| 10 | Looking at Bids | 12 | 0 | 0 | 3.96M |
| 11 | Timing/ Future | 28 | 0 | 0 | 9.07M |
| 12 | Financing | 19 | 0 | 0 | 5.94M |
| 13 | Review price | 23 | 0 | 0 | 7.56M |
| 14 | On Hold (0 - 6 months) | **279** | 1 | 0 | **61.96M** |
| 15 | On Hold (More Than 6 Months) | 103 | 0 | 0 | 23.61M |
| 16 | Last Chance | 5 | 0 | 0 | 1.45M |
| 17 | New Inside | 7 | 0 | 0 | 2.21M |
| 18 | Won | 0 | **475** | 0 | 112.59M |
| 19 | Lost To Competitor | 0 | 0 | 55 | 12.47M |
| 20 | Lost | 0 | 0 | 666 | 123.44M |

### What this means for the metrics
1. **The API only gives each deal's *current* stage. There's no stage history.** A deal that went Walkthrough → Estimate → Won only shows "Won". So "Proposal Sent" and "Showed" can't be counted directly for the past. They have to be *inferred* (proposal below), and from launch onward the sync will save a **daily stage snapshot** so we build real history.
2. **The stage order isn't a funnel order.** "Unqualified Lead" is at position 1, "In-Bound Calls" at 6, and "Last Chance" is after the On Hold stages.
3. **The stage probabilities are GHL's defaults, not real estimates.** They're spaced evenly by position (Won = 88%, Lost = 96%). They can't be used to weight the pipeline, so you need to set them (Q4).
4. **Open Sales pipeline is $149.4M unweighted across 823 deals, and 58% of them haven't changed stage in 90+ days** (42% in 180+ days). On Hold alone is $85.6M. Unweighted, this number would badly mislead ownership.
5. **64 deals are still in "Walkthrough Scheduled" 30+ days later.** Either the walkthrough happened and the stage was never updated, or the deal is dead.

---

## 2. Proposed milestone mapping (please confirm or edit)

| Dashboard milestone | Proposed rule | Confidence |
|---|---|---|
| **Lead** | New contact created (first-seen date), with an opp in Lead / Open House / ADU Seminar / Sales Pipeline. Contacts in "Fake/Spam Number", "Outside Service" or "No Property" (788) are excluded from quality metrics but counted in raw lead volume | High |
| **Contacted** | First **human** outbound call/SMS/email (message `source` = app / mobile / manual, *not* workflow/bulk/AI), or an answered inbound call | High (see section 5) |
| **Appointment Set** | Booking on a walkthrough calendar: *Walkthroughs, Walkthrough (Avenir / David / Eugene / James / Roman), Private ADU Tour*. Cancelled/invalid excluded. *ADU Phone Consultation* and *ADU Webinar* tracked separately | High |
| **Showed** | ⚠️ **Can't be measured from appointment status** (see section 4). Proxy: the Sales opp moved *past* "Walkthrough Scheduled" / "Unqualified Lead" **or** has a $ value. Labeled "estimated" on the dashboard | Low, proxy |
| **Proposal Sent** | Proxy: Sales opp has a monetary value > $0 (estimates get priced), or its current stage is at or past "Estimate Ready (Sales)" | Medium, proxy |
| **Won** | Sales Pipeline `status = won` (476). Won date = `lastStatusChangeAt` | High |
| **Lost** | Sales Pipeline `status = lost` (763). "Abandoned" (75) reported separately | High |

---

## 3. Custom fields and data completeness

22 contact fields and 86 opportunity fields exist. These are the ones the dashboard needs, with the % filled:

| Field (GHL name) | Object | Lead Pipeline | Sales Pipeline | **Won deals** | Sales opps created 2026 |
|---|---|---:|---:|---:|---:|
| Property Address (→ city) | opp | 2% | 92% | **91%** | 98% |
| Type of Build (Detached / Attached / Garage / Home) | opp | 0% | 60% | **78%** | 63% |
| Addition Type (lead-form answer) | opp | 40% | 34% | 25% | 55% |
| Sacramento Or Bay Area | opp | 0% | 43% | 46% | 65% |
| Budget (lead-form range) | opp | 49% | 37% | 29% | 55% |
| Funding (Cash / Finance Josh / 3rd Party / Pending) | opp | 0% | 27% | **35%** | 39% |
| How will they finance? (HELOC etc.) | opp | 0% | 3% | 1% | 5% |
| Homeowners Motivation To Build an ADU | opp | 1% | 25% | **14%** | 61% |
| How did you hear about IMKAT? | opp | 3% | 5% | 5% | 0% |
| UTM Source / Campaign / Medium / Content / Term | contact | 0.2% | – | – | – |

**Takeaways**
- **City / region:** use the Property Address. It gives a city for **86% of won deals**, which is far better than the region dropdown (46%). Sacramento Or Bay Area gets derived from the city.
- **Project type:** use "Type of Build", with "Addition Type" as a fallback. That gives about 80% coverage on won deals.
- **Buyer motivation (retirement / family / rental):** free text, filled on only 14% of wins, but **61% on 2026 Sales opps**. It's reportable for 2026 cohorts only. Values need grouping ("Mom", "For mom", "Family" → Family/Parents).
- **Financing:** 35% of wins. Reportable with a low-confidence flag.
- Tags **don't** carry segments reliably. "bay area" = 0 contacts, "cash purchase" = 1. There are **4,083 open-house tags spread over ~50 per-event tag names**, which is how event attendance can be tracked.

---

## 4. Appointments: show/no-show isn't tracked

| Status on past appointments | Count |
|---|---:|
| confirmed | 2,564 |
| cancelled | 253 |
| invalid / new | 36 |
| **no-show** | **5** |
| **showed** | **1** |

**Reps almost never update appointment status after the walkthrough.** 90% of past appointments are still "confirmed". Show rate, cost per showed appointment and close rate (won ÷ showed) **can't be calculated honestly** from this. Options:
- (a) Use the stage-based "Showed" proxy from section 2, clearly labeled as an estimate, **and**
- (b) have reps mark showed / no-show going forward. A GHL workflow can remind the rep one hour after appointment end until it's marked. That gives real show rates from the day it starts.

Other appointment facts:
- **Walkthroughs by rep:** David Dushkov 614, Eugene Nikolaiev 607, Avenir Golovin 593, James Pal 416, Roman Semenchuk 107, Nik Tkachuk 70.
- 323 appointments were booked by **Conversation AI** and 139 through the booking widget. The rest were booked by hand.
- **74% of won deals** have a matching appointment in GHL (82% for 2026 wins).
- 35 duplicate appointment records came back from the API. They're deduped by ID.

---

## 5. Speed to lead: feasibility

172,520 messages (Apr 2024 – today) were pulled with timestamps, direction, channel and **sender type**. The GHL export reported ~178.7K in total. The ~3.5% gap is most likely deleted or pre-2024 messages and is flagged for the reconciliation check.

**Automated vs. human is cleanly separable by the message `source` field:**

| Sender type (`source`) | Outbound msgs | What it is | Proposed treatment |
|---|---:|---|---|
| `workflow` | 62,600 (56K SMS + 6.4K ringless voicemail) | GHL automations | **Exclude** (automated) |
| `bulk_actions` | 3,940 SMS | Mass texts | **Exclude** |
| `app` | 51,211 (24K calls, 24K SMS, 2.8K FB/IG DMs) | A person in GHL / mobile app | **Count** as human contact |
| `api` | 9,619 (custom SMS provider + custom calls, 4 sending numbers) | Third-party tool (SendBlue / dialer?) | **Need your call (Q7)** |

⚠️ Workflow messages carry the *assigned rep's* userId (e.g. 14,854 workflow texts are stamped "Christian Dershem"). **userId doesn't mean a human sent it.** Only the `source` field does.

**Coverage (2026 contacts created Jan 1 – Sep 14):**
- 95% have at least one message logged. 76% got an automated touch, and **64% got a human touch**.
- For Lead/Sales-pipeline contacts (excluding spam, outside-service and no-property): **91.5% have a human outbound logged**, so speed to lead is measurable for inside sales.
- Open House / Seminar sign-ups: only 30% get a human outbound in GHL.

**Two limits:**
1. **Closers barely log in GHL.** App-sent messages by user: Christian Dershem 34,828 · Roman Semenchuk 7,513 · Nelli Silchuk 3,772 · Ashely Smith 3,632, but James Pal 152, Eugene 24, David Dushkov 22, Avenir 9. **Avenir, David, Eugene and James talk to clients outside GHL** (personal cell / email). So rep-level speed to lead, contact attempts and "stale lead" measure the **inside-sales team**, not the closers. For closers, stale = days since the opp's last stage change.
2. **"Completed" calls aren't conversations:** 64% of completed outbound calls last under 30 seconds (voicemail / hang-up). Only 19% run 60s+. Proposed: **Contact attempt** = any human outbound. **Contacted (connected)** = a human call of 60s+, **or** an inbound reply (SMS/call/DM) after a human outbound (Q8).

Business-hours split, 48-hour attempt counts and booking/close rate by speed bucket are all computable once the rules above are confirmed.

---

## 6. Attribution health (the biggest data problem)

**Won deals with a source value:**

| Year won | Won deals | Opp "source" filled |
|---|---:|---:|
| 2024 | 126 | 23% |
| 2025 | 223 | 53% |
| 2026 YTD | 127 | **70%** |
| **All** | **476** | **50%** |

**All contacts (leads) with any usable source, by quarter created:**

| Quarter | New contacts | Any source | Has UTM / click ID |
|---|---:|---:|---:|
| 2025 Q1 | 2,210 | 11% | 8% |
| 2025 Q2 | 2,166 | 36% | 26% |
| 2025 Q3 | 2,111 | 33% | 23% |
| 2025 Q4 | 2,639 | 45% | 21% |
| 2026 Q1 | 2,780 | 28% | 18% |
| 2026 Q2 | 2,423 | 19% | 14% |
| 2026 Q3 | 2,706 | 29% | 22% |

**Why it's so low**
1. **Native GHL attribution is basically off.** Only 0.3% of contacts have UTMs in GHL's attribution object, and gclid/fbclid are on under 0.2%. 50% of contacts show first touch = "CRM Workflows", meaning the contact was created by an automation (Zapier / lead form / Meta Lead Ads push), so the ad click is lost.
2. **The UTM custom fields (utm_source etc.) are 0.2% filled.** The forms aren't mapping hidden fields into them.
3. **Where attribution does exist, it's free text in `source`:** **285 different spellings** on opportunities and 833 on contacts, e.g. `facebook bay+area`, `facebook bay area`, `fb bay-area`, `meta bayarea`, `meta bay area`, `meta ads - sacramento`, `meta sacramento  lovable`. There are also landing-page URLs with UTMs in them, which I *can* parse (`?utm_source=facebook&utm_campaign=bayarea&utm_content=duplextour`).
4. **Some sources carry Meta campaign/ad IDs** (`facebook 120233975470260382`). Those can be joined to Meta Ads exactly once Meta access is in.
5. **Google leads have no gclid**, so Google can only be matched at the "google-ads sacramento / solano / east-bay / san-jose" campaign-name level.
6. "organic" is the single largest labeled source (95 wins), and it can't be split into SEO / GMB / social / word of mouth. "organic gmb" and "organic bio" exist only for a minority.

**What this means:** channel ROAS and cost per job won *can* be built for 2026, where 70% of wins have a source, with the remaining 30% shown as **Unattributed**. For 2024–2025 it's too thin to use. I'll show those years as volume-only.

---

## 7. Sales team and ownership data

**Sales Pipeline opps by owner:** Avenir Golovin 528 · Eugene Nikolaiev 482 · David Dushkov 446 · James Pal 258 · Roman Semenchuk 87 · Christian Dershem 55 · **Unassigned 189 + 70 assigned to a blank user ID** (12% total).
**Lead Pipeline:** 42% unassigned. Christian Dershem 2,940 and Ashely Smith 633 handle top-of-funnel. Roman 195.
**Contacts:** 69% have no assigned user.

The consultant list (from the "Which consultant…" dropdown and the walkthrough calendars) is **Avenir, David, Eugene, James, Roman**. There are 29 users in the account, including agency and admin logins. **Leaderboard proposal:** closers = Avenir Golovin, David Dushkov, Eugene Nikolaiev, James Pal, Roman Semenchuk; setters / inside sales = Christian Dershem, Ashely Smith, Nelli Silchuk (Roman does both). Please confirm (Q6).

---

## 8. Other data issues

| # | Issue | Impact / handling |
|---|---|---|
| 1 | **Lost reasons:** 706 of 763 lost Sales deals (**93%**) have no reason. Only 9 reasons are defined | "Top lost reasons" isn't reliable. Shown with a sample-size flag. Recommend making lost reason required |
| 2 | 44 won deals have $0 value (9%) | Excluded from revenue and average deal size, and counted as a data-health item |
| 3 | 26 contacts have 2+ won deals (multi-unit / multi-project) | Count jobs by **opportunity**, not contact (Q3) |
| 4 | Won deal size: median **$247K**, IQR $196K–$305K, max $988K. 4 wins under $50K (design agreements?) | Proposed: flag deals under $50K as "design / pre-construction" and keep them out of the build average (Q2) |
| 5 | Inside Sales pipeline holds $127M of "open" value that isn't in the Sales Pipeline | Excluded from forecast unless you say otherwise (Q5) |
| 6 | Sales cycle, **lead created → won: median 61 days** (IQR 30–162). Sales opp created → won: median 52 days | Cohort view needs about 6 months of maturity before close rates settle |
| 7 | Won date = `lastStatusChangeAt`. If someone edits a won deal's status later, the date moves | Daily snapshots from launch will lock in the first won date |
| 8 | 8 opportunities point to a deleted pipeline | Excluded |

The earlier "Imkat ADs Report" Google Sheet audit still applies to spend: Oct 2025 Facebook entered as text, Mar 2025 Facebook blank, Aug–Dec 2026 billboard entered ahead of time, and lead-summary totals that don't add up. Google + Meta spend will come from the platform APIs instead.

---

## 9. Still needed

- **Google Ads API:** developer token, OAuth client ID/secret, refresh token, Customer ID (+ MCC login-customer-id)
- **Meta Marketing API:** System User token with `ads_read`, plus the Ad Account ID
- Answers to the confirmation questions (sent in chat)
