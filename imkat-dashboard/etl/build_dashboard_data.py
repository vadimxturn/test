"""Build dashboard/data.json from the raw GHL pulls.

Inputs (in DATA_DIR, produced by the pull scripts): opps.json, contacts.json,
appts.json, messages.json, pipelines.json, users.json, cf_all.json,
lostreasons.json. Output: a compact, PII-light JSON the dashboard page reads.
Customer names are reduced to "First L." on open deals only.

Usage: python build_dashboard_data.py <DATA_DIR> <OUT_JSON>
"""
import json, re, sys, datetime as dt
import pandas as pd

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from mapping import channel, region, UNATTRIBUTED  # noqa: E402

DATA, OUT = sys.argv[1], sys.argv[2]
P = lambda f: json.load(open(f"{DATA}/{f}"))
TZ = "America/Los_Angeles"
NOW = pd.Timestamp.now(tz="UTC")

REPS = {"David Dushkov": "David", "James Pal": "James", "Eugene Nikolaiev": "Eugene", "Avenir Golovin": "Avenir"}
INSIDE = {"Christian Dershem": "Christian", "Chrisitan D": "Christian", "Ashely Smith": "Ashely",
          "Nelli  Silchuk": "Nelli", "Roman Semenchuk": "Roman"}
STAGE_GROUP = {
    "Estimate Ready (Sales)": "ready", "Proposal Sent to Client": "ready", "Contact Made/ Pending": "ready",
    "Review W/Decision Makers": "ready", "Looking at Bids": "ready", "Financing": "ready", "Review price": "ready",
    "Last Chance": "ready", "New Inside": "ready", "In-Bound Calls": "ready",
    "Walkthrough Scheduled": "pre", "Walkthrough Completed": "pre", "Ready for Estimate (BT)": "pre",
    "Estimate Needs Revision": "pre",
    "Timing/ Future": "hold", "On Hold (0 - 6 months)": "hold", "On Hold (More Than 6 Months)": "hold",
    "Unqualified Lead": "unq",
}
JUNK_STAGES = {"Fake/Spam Number", "Outside Service", "No Property"}

users = {u["id"]: u["name"] for u in P("users.json")["users"]}
pipes = P("pipelines.json")["pipelines"]
pname = {p["id"]: p["name"] for p in pipes}
sname = {s["id"]: s["name"].strip() for p in pipes for s in p["stages"]}
stage_order = {s["name"].strip(): s["position"] for p in pipes if p["name"] == "Sales Pipeline" for s in p["stages"]}
fname = {f["id"]: f["name"].strip() for f in P("cf_all.json")["customFields"]}
lost_reason = {r["_id"]: r["name"] for r in P("lostreasons.json")["lostReasons"]}


def ts(s):
    return pd.to_datetime(s, utc=True, format="ISO8601")


def day(t):
    return t.tz_convert(TZ).strftime("%Y-%m-%d") if pd.notna(t) else None


def cf(cfs):
    out = {}
    for x in cfs or []:
        v = x.get("fieldValueString") or x.get("fieldValue") or x.get("fieldValueArray")
        if v not in (None, "", []):
            out[fname.get(x["id"], x["id"])] = ", ".join(map(str, v)) if isinstance(v, list) else v
    return out


# ---------------------------------------------------------------- opportunities
O = pd.DataFrame(P("opps.json"))
O["pl"] = O.pipelineId.map(pname)
O = O[O.pl.isin(["Lead Pipeline", "Sales Pipeline"])].copy()
O["stage"] = O.pipelineStageId.map(sname)
O["created"] = ts(O.createdAt)
O["closed"] = ts(O.lastStatusChangeAt)
O["stage_at"] = ts(O.lastStageChangeAt)
O["val"] = O.monetaryValue.fillna(0).astype(float)
O["owner"] = O.assignedTo.map(users)
O["cfd"] = O.customFields.map(cf)
O["src_ok"] = O.source.fillna("").str.strip() != ""

C = pd.DataFrame(P("contacts.json")).set_index("id")
C["added"] = ts(C.dateAdded)
A = pd.DataFrame(P("appts.json")).drop_duplicates("id")
A = A[A._calendarName.str.contains("Walkthrough")].copy()
A["start"] = ts(A.startTime)
A["booked"] = ts(A.dateAdded)
A["rep"] = A.assignedUserId.map(users).map(REPS)

# ---------------------------------------------------------------- per-contact dims
univ = pd.Index(O.contactId.unique()).union(pd.Index(A.contactId.unique())).intersection(C.index)
first_src = O[O.src_ok].sort_values("created").groupby("contactId").source.first()
csrc = C.source.where(C.source.fillna("").str.strip() != "")
raw = first_src.reindex(univ).combine_first(csrc.reindex(univ))
sales_first = O.sort_values(["pl", "created"], ascending=[False, True])


def first_field(name):
    s = sales_first.assign(v=sales_first.cfd.map(lambda d: d.get(name))).dropna(subset=["v"])
    return s.groupby("contactId").v.first()


fld, adr = first_field("Sacramento Or Bay Area"), first_field("Property Address")
K = pd.DataFrame({"raw": raw}).join(fld.rename("fld")).join(adr.rename("adr")).join(C[["postalCode", "phone", "added"]])
K["ch"] = K.raw.map(channel)
reg = [region(f if isinstance(f, str) else None, a, z, r, p)
       for f, a, z, r, p in zip(K.fld, K.adr, K.postalCode, K.raw, K.phone)]
K["rg"] = [r[0] for r in reg]
K["rg_basis"] = [r[1] for r in reg]
first_opp = O.groupby("contactId").created.min()
first_appt = A.groupby("contactId").booked.min()
K["lead_at"] = pd.concat([first_opp, first_appt], axis=1).min(axis=1).reindex(K.index)
K["junk"] = K.index.isin(O[O.stage.isin(JUNK_STAGES)].contactId)


def city_of(a):
    if not isinstance(a, str):
        return None
    parts = [p.strip() for p in a.split(",")]
    for i, p in enumerate(parts):
        if re.match(r"^(CA|California)\b", p, re.I) and i > 0:
            return parts[i - 1].title()
    return None


K["city"] = K.adr.map(city_of)

# ---------------------------------------------------------------- speed to lead
M = pd.DataFrame(P("messages.json"))
M["t"] = ts(M.dateAdded)
human = M[(M.direction == "outbound") & (M.source == "app")].sort_values("t")
human = human[human.contactId.isin(K.index)]
hmap = human.groupby("contactId")


def speed(cid, lead_at):
    if cid not in hmap.groups or pd.isna(lead_at):
        return None, 0, None
    h = hmap.get_group(cid)
    h = h[h.t >= lead_at - pd.Timedelta(minutes=10)]
    if h.empty:
        return None, 0, None
    first = h.iloc[0]
    mins = max(0.0, (first.t - lead_at).total_seconds() / 60)
    att48 = int((h.t <= lead_at + pd.Timedelta(hours=48)).sum())
    who = users.get(first.userId)
    return round(mins, 1), att48, INSIDE.get(who, REPS.get(who, "Other" if who else None))


def biz_hours(t):
    lt = t.tz_convert(TZ)
    return int(lt.weekday() < 5 and 8 <= lt.hour < 18)


# ---------------------------------------------------------------- records
S = O[O.pl == "Sales Pipeline"].copy()
S["rep"] = S.owner.map(REPS)
won_contacts = S[S.status == "won"].groupby("contactId").agg(won_at=("closed", "min"), won_v=("val", "sum"))


def dims(cid):
    k = K.loc[cid] if cid in K.index else None
    return (k.ch, k.rg) if k is not None else (UNATTRIBUTED, "Unknown")


leads = []
for cid, k in K[K.lead_at.notna()].iterrows():
    mins, att, who = speed(cid, k.lead_at)
    leads.append({"d": day(k.lead_at), "ch": k.ch, "rg": k.rg, "q": int(not k.junk),
                  "spd": mins, "a48": att, "by": who, "bh": biz_hours(k.lead_at)})

appts = []
for _, a in A[A.rep.notna() & ~A.appointmentStatus.isin(["cancelled", "invalid"])].iterrows():
    ch, rg = dims(a.contactId)
    w = won_contacts.loc[a.contactId] if a.contactId in won_contacts.index else None
    appts.append({"d": day(a.start), "rep": a.rep, "ch": ch, "rg": rg,
                  "w": int(w is not None and w.won_at >= a.start - pd.Timedelta(days=1)),
                  "wv": float(w.won_v) if w is not None else 0})

def ptype(d):
    t = d.get("Type of Build") or d.get("Addition Type") or ""
    for key in ["Garage Conversion", "Attached ADU", "Detached ADU", "Home"]:
        if key.lower() in t.lower():
            return {"Home": "New home"}.get(key, key)
    return "Unknown" if not t else "Other"


def funding(d):
    f = (d.get("Funding") or d.get("How will they finance?") or "").lower()
    if not f:
        return "Unknown"
    if "cash" in f:
        return "Cash"
    if "pending" in f:
        return "Financing pending"
    if "heloc" in f or "equity" in f:
        return "HELOC / home equity"
    return "Financed"


def motivation(d):
    m = (d.get("Homeowners Motivation To Build an ADU") or "").lower()
    if not m:
        return "Unknown"
    if re.search(r"rent|income|invest", m):
        return "Rental income"
    if re.search(r"mom|dad|parent|family|fam|kid|son|daught|mother|father|in-law|retire|aging", m):
        return "Family / parents"
    return "Other"


closed = []
for _, o in S[S.status.isin(["won", "lost"])].iterrows():
    ch, rg = dims(o.contactId)
    k = K.loc[o.contactId] if o.contactId in K.index else None
    lead_at = k.lead_at if k is not None else pd.NaT
    closed.append({"d": day(o.closed), "s": o.status, "rep": o.rep or "Other", "ch": ch, "rg": rg,
                   "v": o.val, "cyc": int((o.closed - lead_at).days) if pd.notna(lead_at) else None,
                   "pt": ptype(o.cfd), "fn": funding(o.cfd), "mo": motivation(o.cfd),
                   "city": k.city if k is not None else None,
                   "lr": lost_reason.get(o.lostReasonId) if o.status == "lost" else None})


def short(n):
    parts = [p for p in re.split(r"\s+", str(n or "").strip()) if p and not re.match(r"^[\d(+]", p)]
    return f"{parts[0].title()} {parts[-1][0].upper()}." if len(parts) >= 2 else (parts[0].title() if parts else "—")


opens = []
for _, o in S[S.status == "open"].iterrows():
    ch, rg = dims(o.contactId)
    opens.append({"nm": short(o["name"]), "st": o.stage, "sp": stage_order.get(o.stage, 99),
                  "g": STAGE_GROUP.get(o.stage, "other"), "rep": o.rep or "Other", "ch": ch, "rg": rg,
                  "v": o.val, "age": int((NOW - o.stage_at).days), "pt": ptype(o.cfd)})

# ---------------------------------------------------------------- data health
Kq = K[K.lead_at.notna()]
health_month = (Kq.assign(m=Kq.lead_at.dt.tz_convert(TZ).dt.strftime("%Y-%m"), att=Kq.ch != UNATTRIBUTED,
                          reg=~Kq.rg.isin(["Unknown"]), regest=Kq.rg_basis == "Phone area code (est.)")
                .groupby("m").agg(n=("ch", "size"), att=("att", "mean"), reg=("reg", "mean"), regest=("regest", "mean"))
                .reset_index())
Sw = S[S.status == "won"]
field_fill = {name: round(float(Sw.cfd.map(lambda d: name in d).mean()), 3) for name in
              ["Property Address", "Type of Build", "Sacramento Or Bay Area", "Funding",
               "Homeowners Motivation To Build an ADU", "Budget"]}
past = pd.DataFrame(P("appts.json")).drop_duplicates("id")
past = past[ts(past.startTime) < NOW]
health = {
    "month": health_month.round(3).to_dict("records"),
    "won_fields": field_fill,
    "won_no_value": int((Sw.val == 0).sum()), "won_total": int(len(Sw)),
    "lost_no_reason": int(S[(S.status == "lost")].lostReasonId.isna().sum()), "lost_total": int((S.status == "lost").sum()),
    "sales_unassigned": int((~S.owner.isin(users.values()) | S.owner.isna()).sum()), "sales_total": int(len(S)),
    "lead_unassigned": int(O[O.pl == "Lead Pipeline"].owner.isna().sum()), "lead_total": int((O.pl == "Lead Pipeline").sum()),
    "appt_status": past.appointmentStatus.value_counts().to_dict(),
    "bulk_days": [{"d": d, "won": int(n)} for d, n in
                  Sw.closed.dt.tz_convert(TZ).dt.strftime("%Y-%m-%d").value_counts().head(4).items() if n >= 10],
    "region_basis": K[K.lead_at >= pd.Timestamp("2026-01-01", tz="UTC")].rg_basis.value_counts().to_dict(),
    "distinct_sources": int(O.source.fillna("").str.strip().str.lower().nunique()),
    "other_sources": K[K.ch == "Other"].raw.str.lower().value_counts().head(10).to_dict(),
}

# Manual spend sheet ("Imkat ADs Report", Actual 2026). Replaced by the Google Ads / Meta APIs once connected.
spend = [
    {"m": "2026-01", "ch": "Meta Ads", "rg": "Sacramento", "v": 9682.35}, {"m": "2026-01", "ch": "Meta Ads", "rg": "Bay Area", "v": 12106.44},
    {"m": "2026-01", "ch": "Google Ads", "rg": "Sacramento", "v": 4997.61}, {"m": "2026-01", "ch": "Google Ads", "rg": "Bay Area", "v": 11349.90},
    {"m": "2026-02", "ch": "Meta Ads", "rg": "Sacramento", "v": 8498.59}, {"m": "2026-02", "ch": "Meta Ads", "rg": "Bay Area", "v": 8012.90},
    {"m": "2026-02", "ch": "Google Ads", "rg": "Sacramento", "v": 4437.54}, {"m": "2026-02", "ch": "Google Ads", "rg": "Bay Area", "v": 8009.76},
    {"m": "2026-03", "ch": "Meta Ads", "rg": "Sacramento", "v": 12847.08}, {"m": "2026-03", "ch": "Meta Ads", "rg": "Bay Area", "v": 17546.97},
    {"m": "2026-03", "ch": "Google Ads", "rg": "Sacramento", "v": 3308.16}, {"m": "2026-03", "ch": "Google Ads", "rg": "Bay Area", "v": 4884.06},
    {"m": "2026-04", "ch": "Meta Ads", "rg": "Sacramento", "v": 11851.73}, {"m": "2026-04", "ch": "Meta Ads", "rg": "Bay Area", "v": 15794.17},
    {"m": "2026-04", "ch": "Google Ads", "rg": "Sacramento", "v": 3218.18}, {"m": "2026-04", "ch": "Google Ads", "rg": "Bay Area", "v": 5443.52},
    {"m": "2026-05", "ch": "Meta Ads", "rg": "Sacramento", "v": 12376.63}, {"m": "2026-05", "ch": "Meta Ads", "rg": "Bay Area", "v": 23909.52},
    {"m": "2026-05", "ch": "Google Ads", "rg": "Sacramento", "v": 4574.00}, {"m": "2026-05", "ch": "Google Ads", "rg": "Bay Area", "v": 9027.23},
    {"m": "2026-06", "ch": "Meta Ads", "rg": "Sacramento", "v": 9285.71}, {"m": "2026-06", "ch": "Meta Ads", "rg": "Bay Area", "v": 24280.71},
    {"m": "2026-06", "ch": "Google Ads", "rg": "Sacramento", "v": 3454.32}, {"m": "2026-06", "ch": "Google Ads", "rg": "Bay Area", "v": 6784.67},
    {"m": "2026-07", "ch": "Meta Ads", "rg": "Sacramento", "v": 13759.26}, {"m": "2026-07", "ch": "Meta Ads", "rg": "Bay Area", "v": 14872.50},
    {"m": "2026-07", "ch": "Google Ads", "rg": "Sacramento", "v": 3300.42}, {"m": "2026-07", "ch": "Google Ads", "rg": "Bay Area", "v": 8506.30},
]

out = {"generated": NOW.tz_convert(TZ).strftime("%Y-%m-%d %H:%M PT"), "today": NOW.tz_convert(TZ).strftime("%Y-%m-%d"),
       "reps": list(REPS.values()), "leads": leads, "appts": appts, "closed": closed, "open": opens,
       "spend": spend, "spend_through": "2026-07-31", "health": health}
def clean(x):
    if isinstance(x, dict):
        return {str(k): clean(v) for k, v in x.items()}
    if isinstance(x, list):
        return [clean(v) for v in x]
    if isinstance(x, float) and x != x:
        return None
    if hasattr(x, "item"):          # numpy scalars
        return clean(x.item())
    return x


json.dump(clean(out), open(OUT, "w"), separators=(",", ":"), allow_nan=False)
print(f"wrote {OUT}: {len(leads)} leads, {len(appts)} appts, {len(closed)} closed, {len(opens)} open")
