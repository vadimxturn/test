# IMKAT Homes Performance Dashboard: Step 1 Data Audit

Audit date: 2026-09-22
Status: **Waiting on access and stage-mapping confirmation. No metrics have been calculated.**

---

## 1. What I could and couldn't reach

| Source | Access | Notes |
|---|---|---|
| GoHighLevel API v2 | ❌ Not connected | No connector, no Private Integration token in the environment |
| Google Ads API | ❌ Not connected | No developer token / OAuth credentials |
| Meta Marketing API | ❌ Not connected | No system-user token |
| Google Drive | ✅ Connected | Found **"Imkat ADs Report"** (manual spend + won-deal log). Audited below |

So the **pipeline stage names, custom fields, and GHL attribution %** asked for in the brief **can't be reported yet**. They need a GHL token (see section 5). None of it is guessed below.

---

## 2. Audit of "Imkat ADs Report" (Google Sheet)

This is the closest thing to ground truth I can see right now. It's a manual sheet, not a CRM export, so the dashboard should **not** be built on it. It is still useful for checking the GHL numbers once they're connected.

### 2a. Spend tabs: errors found

| # | Issue | Impact |
|---|---|---|
| 1 | **Oct 2025 Facebook** is typed as text `28.846.53` (two periods), so it's **left out of the total**. Oct total shows $17,070.06. It should be ~$45,916.59 | Oct 2025 spend understated by **$28,846.53** |
| 2 | **Mar 2025 Facebook** cell is blank (whitespace). Total shows $25,968.53, which is Google + billboard only | Mar 2025 Meta spend **missing** |
| 3 | **2026 billboard** is filled in for Aug–Dec ($18,650/mo) but every other channel stops at July | Those look like commitments, not actuals. They can't be counted as spend yet |
| 4 | **July 2026 Events/Promos** is blank | Either $0 or missing. Need to confirm |
| 5 | Header labels are confusing: the budget block above "Actual 2026" is titled "Projected/Budget 2025". A second budget block is titled "Castro Valley" and its Total row only fills Jan–Apr + Jun ($10,500) | Budget vs. actual comparisons from this sheet are unreliable |
| 6 | Sacramento lead-summary table: leads column adds to **371**, but Total says **479**. Bay Area "Calls" total says 172 (it should be 27). **No date range on either table** | Can't be used as a CPL baseline |
| 7 | Google 2025 note: "includes test ads for local service + youtube" (April $14,369) | Google Search spend in 2025 is mixed with LSA/YouTube |

Checked and correct: the 2026 Jan–Jul monthly totals add up (e.g. Jan $61,715.73, Jul $72,088.48).

**Structural point:** billboard + TV + events make up **~35–51% of monthly marketing spend** in Jan–Jul 2026 and have no digital attribution. Per the brief, "ad spend" = Google + Meta. I'd recommend showing **Total marketing spend** (all channels) separately from **Paid digital spend** (Google + Meta) so ROAS isn't inflated or deflated. See Q7.

### 2b. Won-deal log: attribution health (manual source labels)

62 deals with a month tagged Jan–May:

| Source bucket | Deals | % |
|---|---:|---:|
| Paid digital (Facebook / Instagram / Google, all geos) | 23 | 37.1% |
| "Organic" / "Social Organic" | 19 | 30.6% |
| Unknown or blank | 7 | 11.3% |
| Events (Open House, ADU Seminar, 5k Promo) | 6 | 9.7% |
| "Call Main" (inbound phone, origin unknown) | 4 | 6.5% |
| Referral ("A Friend") | 2 | 3.2% |
| Radio | 1 | 1.6% |

**Findings:**
- **~18% of won deals can't be traced to where they came from** (Unknown + blank + Call Main). Under the "never guess" rule these go to **Unattributed**.
- **"Organic" is 31% of wins and too vague to act on.** It could mean SEO city pages, organic social, word of mouth, or a returning lead. The dashboard can't credit SEO without UTMs or a GHL source field that separates these.
- **Source labels are free text and inconsistent:** `Instagram Sacramento` vs `Facebook Sacramento` (both Meta), `Refferal` vs `A Friend`, `SEO` vs `Organic`, `Google Solano` / `Google East Bay` / `Google San Jose`. These need a single mapping table (see Q5).
- **Geo mismatch:** "Griham Living – Los Altos" (Bay Area) is attributed to **Instagram Sacramento**. That's either a campaign-targeting overlap or a labeling error.
- **Missing contract values:** Marc Mangino, KUAN LLC (Mar), Philip Socklov (Apr), **all 6 May deals**, and **all ~32 September rows**. There are also 22 more rows with no month, source or value.
- **Non-build deals mixed in with builds:** Kamina Staples ($20K "Design Agreement") and Chew Investment Partners ($10K). If these count as "Jobs Won" they pull down average deal size (see Q2).
- **Duplicates / multi-project clients:** Angel Cacho appears 4 times (3 projects + a September row). We need to decide whether we count by **opportunity** or by **contact** (see Q3).
- The **year** of the deal log isn't labeled.
- Contract values range from **$136K to $988K** for full builds. I haven't computed an average from this sheet on purpose, because of the gaps above.

---

## 3. Still to audit once GHL is connected

When the token is in place I'll pull and report:
1. Every pipeline, with exact stage names and IDs, plus deal count and value per stage
2. Every custom field (name, key, type, % filled) for project type, city, budget, financing, timeline, motivation
3. Tags in use (retirement / rental / family etc.), with counts
4. Attribution health: % of contacts with `utm_source`, `utm_campaign`, `gclid`/`fbclid`, or a non-empty `source`, split by created month
5. Unassigned contacts/opportunities, and opportunities with $0 or empty monetary value
6. Calendar list with status distribution (confirmed / showed / no-show / cancelled). This tells us whether reps actually mark shows
7. Conversation message types, and which senders are automations vs. humans (for speed to lead)
8. Lost-reason list and how consistently it's filled in
9. A comparison of GHL won deals against this manual sheet, to find deals missing from GHL

---

## 4. Proposed stage mapping template (for you to fill in / confirm)

| Dashboard milestone | Which GHL stage(s) or event counts? |
|---|---|
| Lead | Contact created (or opportunity created?) |
| Contacted | First human outbound call/SMS/email |
| Appointment Set | ? |
| Showed | ? (stage, or appointment status = showed?) |
| Proposal Sent | ? |
| Won | Opportunity status = won? Or a stage like "Contract Signed"? |
| Lost | Opportunity status = lost + lost reason |

Stage probabilities for the weighted pipeline: **not set yet.**

---

## 5. Access needed

Add these as environment variables in this cloud environment's settings. Please don't paste them into chat.

**GoHighLevel:** Private Integration token (Settings → Private Integrations) plus the Location ID. Read-only scopes:
`contacts.readonly, opportunities.readonly, calendars.readonly, calendars/events.readonly, conversations.readonly, conversations/message.readonly, users.readonly, locations.readonly, locations/customFields.readonly, locations/tags.readonly`
→ `GHL_TOKEN`, `GHL_LOCATION_ID`

**Google Ads:** developer token, OAuth client ID/secret, refresh token, Customer ID (+ MCC login-customer-id if it's under your agency MCC)
→ `GADS_DEVELOPER_TOKEN`, `GADS_CLIENT_ID`, `GADS_CLIENT_SECRET`, `GADS_REFRESH_TOKEN`, `GADS_CUSTOMER_ID`, `GADS_LOGIN_CUSTOMER_ID`

**Meta:** System User token with `ads_read`, plus the Ad Account ID
→ `META_TOKEN`, `META_AD_ACCOUNT_ID`

**Fallback if API access is slow:** CSV exports of GHL Contacts + Opportunities + Appointments (all fields, last 18 months), a Google Ads campaign/keyword/search-term report by day, and a Meta ad-level report by day. That's enough for a first version, but it won't include speed to lead (that needs message timestamps).

The environment's network policy also has to allow `services.leadconnectorhq.com`, `googleads.googleapis.com`, `oauth2.googleapis.com` and `graph.facebook.com`.
