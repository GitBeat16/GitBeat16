#!/usr/bin/env python3
"""
Regenerates the data-driven panels of the GitBeat16 profile README.

Outputs: commit-arcade.svg, analytics.svg, languages.svg

Run locally:      python3 generate_profile.py
Run in Actions:   GH_TOKEN=$GITHUB_TOKEN python3 generate_profile.py

With no token it falls back to a neutral placeholder dataset so the render
still succeeds; with a token it uses the real contribution calendar.
"""

import json
import math
import os
import re
import ssl
import urllib.request
from datetime import date, datetime, timedelta

USER = os.environ.get("PROFILE_USER", "GitBeat16")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""
OUT = os.environ.get("OUT_DIR", ".")

FONT = ("&apos;JetBrains Mono&apos;,&apos;Fira Code&apos;,&apos;IBM Plex Mono&apos;,"
        "&apos;Cascadia Mono&apos;,&apos;SF Mono&apos;,ui-monospace,SFMono-Regular,"
        "Menlo,Consolas,&apos;DejaVu Sans Mono&apos;,&apos;Courier New&apos;,monospace")

# monochrome ramp: none -> max
LEV = ["#131313", "#333333", "#575757", "#8c8c8c", "#ffffff"]
LEVEL_MAP = {
    "NONE": 0, "FIRST_QUARTILE": 1, "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3, "FOURTH_QUARTILE": 4,
}

QUERY = """
query($login:String!) {
  user(login:$login) {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
    repositories(first:100, ownerAffiliations:OWNER, isFork:false,
                 orderBy:{field:STARGAZERS, direction:DESC}) {
      totalCount
      nodes {
        stargazerCount
        primaryLanguage { name }
        languages(first:10, orderBy:{field:SIZE, direction:DESC}) {
          edges { size node { name } }
        }
      }
    }
  }
}
"""


# --------------------------------------------------------------------------- data
def fetch():
    if not TOKEN:
        return None
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": QUERY, "variables": {"login": USER}}).encode(),
        headers={
            "Authorization": "bearer " + TOKEN,
            "Content-Type": "application/json",
            "User-Agent": "gitbeat-profile-generator",
        },
    )
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        payload = json.load(r)
    if "errors" in payload:
        raise RuntimeError(payload["errors"])
    return payload["data"]["user"]


def scrape():
    """Token-free live read of the public contribution calendar.

    GitHub serves the same grid the profile page shows at
    /users/<login>/contributions. This keeps the panels live even when the
    workflow has no PAT, or when the default GITHUB_TOKEN cannot reach the
    contributionsCollection API. Returns (days, total) or None.
    """
    url = "https://github.com/users/%s/contributions" % USER
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; gitbeat-profile-generator)",
        "Accept": "text/html",
    })
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        html = r.read().decode("utf-8", "replace")

    # tooltips carry the count: <tool-tip for="cell-id">8 contributions on ...</tool-tip>
    tips = {}
    for cell_id, text in re.findall(
            r'<tool-tip[^>]*\bfor="([^"]+)"[^>]*>(.*?)</tool-tip>', html, re.S):
        m = re.search(r'([\d,]+)\s+contribution', text)
        tips[cell_id] = int(m.group(1).replace(",", "")) if m else 0

    days = []
    for cell in re.findall(r'<td[^>]*\bdata-date="[^"]+"[^>]*>', html):
        d = re.search(r'data-date="(\d{4}-\d{2}-\d{2})"', cell).group(1)
        m = re.search(r'data-count="(\d+)"', cell)          # older markup
        if m:
            count = int(m.group(1))
        else:
            cid = re.search(r'\bid="([^"]+)"', cell)
            count = tips.get(cid.group(1), 0) if cid else 0
        days.append({"date": d, "count": count})

    if not days:
        return None
    days.sort(key=lambda x: x["date"])

    total = sum(d["count"] for d in days)
    stated = re.search(r'([\d,]+)\s+contributions? in the last year', html)
    if stated:
        want = int(stated.group(1).replace(",", ""))
        if want and total != want:
            print("scrape mismatch: cells=%d, page says %d" % (total, want))
            if total == 0:
                return None
    return days, total


def fallback():
    """Real calendar captured from the public profile, used until the
    workflow runs with a token. Falls back to an empty year if absent."""
    seed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             "contributions_seed.json")
    if os.path.exists(seed_path):
        with open(seed_path, encoding="utf-8") as f:
            seed = json.load(f)
        days = seed["days"]
        return days, {
            "total": seed.get("total", sum(d["count"] for d in days)),
            "commits": 0, "prs": 0, "issues": 0, "reviews": 0,
            "repos": seed.get("repos", 0), "stars": 0, "followers": 0,
            "languages": [],
            "placeholder": True,
        }
    today = date.today()
    start = today - timedelta(days=364)
    start -= timedelta(days=(start.weekday() + 1) % 7)
    days = [{"date": (start + timedelta(days=i)).isoformat(), "count": 0}
            for i in range((today - start).days + 1)]
    return days, {"total": 0, "commits": 0, "prs": 0, "issues": 0, "reviews": 0,
                  "repos": 0, "stars": 0, "followers": 0, "languages": [],
                  "placeholder": True}


def shape(user):
    cc = user["contributionsCollection"]
    cal = cc["contributionCalendar"]
    days = []
    for w in cal["weeks"]:
        for d in w["contributionDays"]:
            days.append({
                "date": d["date"],
                "count": d["contributionCount"],
                "level": LEVEL_MAP.get(d["contributionLevel"], 0),
            })

    lang_bytes, stars = {}, 0
    for repo in user["repositories"]["nodes"]:
        stars += repo["stargazerCount"]
        for e in repo["languages"]["edges"]:
            lang_bytes[e["node"]["name"]] = lang_bytes.get(e["node"]["name"], 0) + e["size"]
    total_bytes = sum(lang_bytes.values()) or 1
    ranked = sorted(lang_bytes.items(), key=lambda kv: -kv[1])
    top = [(k, round(v * 100.0 / total_bytes, 1)) for k, v in ranked[:6]]
    if len(ranked) > 6:
        rest = sum(v for _, v in ranked[6:])
        top.append(("Other", round(rest * 100.0 / total_bytes, 1)))

    return days, {
        "total": cal["totalContributions"],
        "commits": cc["totalCommitContributions"],
        "prs": cc["totalPullRequestContributions"],
        "issues": cc["totalIssueContributions"],
        "reviews": cc["totalPullRequestReviewContributions"],
        "repos": user["repositories"]["totalCount"],
        "stars": stars,
        "followers": user["followers"]["totalCount"],
        "languages": top,
        "placeholder": False,
    }


def streaks(days):
    today = date.today().isoformat()
    past = [d for d in days if d["date"] <= today]
    longest = run = 0
    for d in past:
        run = run + 1 if d["count"] > 0 else 0
        longest = max(longest, run)
    cur = 0
    for d in reversed(past):
        if d["count"] > 0:
            cur += 1
        elif cur == 0 and d["date"] == today:
            continue  # today not counted against an otherwise live streak
        else:
            break
    return cur, longest


def level_of(count, buckets):
    if count <= 0:
        return 0
    for i, b in enumerate(buckets):
        if count <= b:
            return i + 1
    return 4


# ------------------------------------------------------------------------ helpers
def defs(w, h, extra=""):
    return f'''  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#000000"/><stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#9a9a9a"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.014"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="50%" stop-color="#ffffff" stop-opacity="0.09"/><stop offset="100%" stop-color="#9a9a9a" stop-opacity="0.5"/>
    </linearGradient>
    <radialGradient id="gA" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <radialGradient id="gB" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#ffffff" stroke-opacity="0.045"/></pattern>
{extra}    <clipPath id="frame"><rect width="{w}" height="{h}" rx="20"/></clipPath>
  </defs>'''


def frame_open(w, h):
    return (f'  <g clip-path="url(#frame)">\n'
            f'    <rect width="{w}" height="{h}" fill="url(#bg)"/>\n'
            f'    <rect width="{w}" height="{h}" fill="url(#grid)"/>')


def frame_close(w, h):
    return (f'    <rect x="0.5" y="0.5" width="{w-1}" height="{h-1}" rx="20" '
            f'fill="none" stroke="url(#edge)" stroke-width="1"/>\n  </g>\n</svg>')


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ------------------------------------------------------------------- commit arcade
def render_arcade(days, meta, cur, longest):
    W, H = 880, 344
    PITCH, CELL = 11, 9
    GX, GY = 48, 104
    ROWS = 7

    # last 52 full weeks, Sunday-aligned
    weeks = [days[i:i + 7] for i in range(0, len(days), 7)]
    weeks = [w for w in weeks if len(w) == 7][-52:]
    while len(weeks) < 52:
        weeks.insert(0, [{"date": "", "count": 0} for _ in range(7)])
    COLS = len(weeks)

    counts = [d["count"] for w in weeks for d in w if d["count"] > 0]
    counts.sort()
    if counts:
        q = [counts[int(len(counts) * f)] for f in (0.25, 0.5, 0.75)]
        buckets = [max(1, q[0]), max(2, q[1]), max(3, q[2])]
    else:
        buckets = [1, 3, 6]

    grid = [[d.get("level", level_of(d["count"], buckets)) for d in w] for w in weeks]

    # laser targets = the seven busiest weeks, spread across the year
    live = [c for c in range(COLS) if sum(d["count"] for d in weeks[c]) > 0]
    ranked = sorted(live, key=lambda c: -sum(d["count"] for d in weeks[c]))
    targets, used = [], []
    for c in ranked:
        if all(abs(c - u) >= 3 for u in used):
            used.append(c)
            targets.append(c)
        if len(targets) == 7:
            break
    # if separation was too strict, top up with any remaining live weeks
    for c in ranked:
        if len(targets) >= min(7, len(live)):
            break
        if c not in targets:
            targets.append(c)
    targets.sort()
    if not targets:
        targets = [COLS - 1]

    DUR, SHOTS = 14.0, len(targets)
    SLOT = DUR / SHOTS
    kt = lambda t: round(max(0.0, min(1.0, t / DUR)), 4)
    tx = lambda c: GX + c * PITCH + CELL / 2

    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'fill="none" role="img" aria-label="Commit Arcade - real GitHub contribution field">']
    o.append(defs(W, H, '''    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/><stop offset="35%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="xp" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#9a9a9a"/>
    </linearGradient>
    <filter id="blur3" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur6" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="6"/></filter>
'''))
    o.append(frame_open(W, H))
    o.append('    <ellipse cx="180" cy="330" rx="300" ry="150" fill="url(#gA)"/>')
    o.append('    <ellipse cx="800" cy="30" rx="240" ry="140" fill="url(#gB)"/>')

    first = next((d["date"] for w in weeks for d in w if d["date"]), "")
    span = f'{first} → {date.today().isoformat()}' if first else 'LAST 52 WEEKS'
    o.append(f'''    <g font-family="{FONT}">
      <text x="28" y="38" font-size="19" font-weight="700" fill="url(#neon)" letter-spacing="3.4">COMMIT ARCADE</text>
      <text x="28" y="58" font-size="10" fill="#6e6e6e" letter-spacing="1.5">EVERY COMMIT IS AN UPGRADE — LIVE CONTRIBUTION FIELD</text>
      <g transform="translate(646,24)">
        <rect width="206" height="24" rx="12" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.28"/>
        <circle cx="15" cy="12" r="3.4" fill="#ffffff"><animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
        <text x="27" y="16" font-size="9" fill="#a0a0a0" letter-spacing="0.9">{span}</text>
      </g>
    </g>''')

    o.append('    <rect x="24" y="80" width="832" height="244" rx="16" fill="url(#glass)"/>')
    o.append('    <rect x="24" y="80" width="832" height="244" rx="16" fill="none" stroke="url(#edge)" stroke-width="1.1"/>')
    o.append('    <path d="M636 100V300" stroke="#ffffff" stroke-opacity="0.07"/>')

    o.append('    <g>')
    for c in range(COLS):
        for r in range(ROWS):
            v = grid[c][r]
            o.append(f'      <rect x="{GX + c*PITCH}" y="{GY + r*PITCH}" width="{CELL}" height="{CELL}" '
                     f'rx="2" fill="{LEV[v]}" opacity="{0.95 if v else 0.5}"/>')
    o.append('    </g>')

    # month ticks
    o.append(f'    <g font-family="{FONT}" font-size="8" fill="#4d4d4d">')
    seen = set()
    for c in range(COLS):
        ds = weeks[c][0]["date"]
        if not ds:
            continue
        mo = ds[:7]
        if mo in seen:
            continue
        seen.add(mo)
        label = datetime.strptime(ds, "%Y-%m-%d").strftime("%b").upper()
        o.append(f'      <text x="{GX + c*PITCH}" y="{GY - 6}">{label}</text>')
    o.append('    </g>')

    # impacts
    for i, t in enumerate(targets):
        t0 = round(i * SLOT + 1.35, 2)
        x, cx = GX + t * PITCH, tx(t)
        cy = GY + (ROWS * PITCH) / 2
        gain = sum(d["count"] for d in weeks[t])
        o.append('    <g>')
        o.append(f'      <rect x="{x-1}" y="{GY-1}" width="{CELL+2}" height="{ROWS*PITCH-1}" rx="3" fill="#ffffff" opacity="0">'
                 f'<animate attributeName="opacity" values="0;0.95;0.28;0" keyTimes="0;0.06;0.4;1" dur="0.85s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/></rect>')
        o.append(f'      <rect x="{x-3}" y="{GY-3}" width="{CELL+6}" height="{ROWS*PITCH+3}" rx="5" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0">'
                 f'<animate attributeName="opacity" values="0;1;0" keyTimes="0;0.1;1" dur="0.8s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/></rect>')
        o.append(f'      <circle cx="{cx}" cy="{cy}" r="4" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0">'
                 f'<animate attributeName="r" values="4;40" dur="0.9s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/>'
                 f'<animate attributeName="opacity" values="0.9;0" dur="0.9s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/></circle>')
        for p in range(7):
            ang = (p / 7) * 6.28318 + i
            dx = round(math.cos(ang) * (24 + (p % 3) * 8), 1)
            dy = round(math.sin(ang) * (18 + (p % 4) * 5), 1)
            col = "#ffffff" if p % 3 else "#9a9a9a"
            o.append(f'      <circle cx="{cx}" cy="{cy}" r="{1.4 + (p % 3) * 0.4}" fill="{col}" opacity="0">'
                     f'<animate attributeName="opacity" values="0;1;0" keyTimes="0;0.12;1" dur="0.95s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/>'
                     f'<animateTransform attributeName="transform" type="translate" values="0 0;{dx} {dy}" dur="0.95s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/></circle>')
        o.append(f'      <text x="{cx}" y="{GY + ROWS*PITCH + 20}" text-anchor="middle" font-family="{FONT}" font-size="10.5" '
                 f'font-weight="700" fill="#ffffff" opacity="0">+{gain}'
                 f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.6;1" dur="1.4s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/>'
                 f'<animateTransform attributeName="transform" type="translate" values="0 10;0 -4" dur="1.4s" begin="{t0}s" repeatCount="indefinite" repeatDur="{DUR}s"/></text>')
        o.append('    </g>')

    # travel path shared by beam + robot
    xs, ks = [], []
    for i, t in enumerate(targets):
        if i == 0:
            xs.append(tx(targets[-1])); ks.append(0.0)
        xs.append(tx(t)); ks.append(kt(i * SLOT + 1.05))
        xs.append(tx(t)); ks.append(kt(i * SLOT + 2.0))
    xs.append(tx(targets[-1])); ks.append(1.0)
    XV = "; ".join(f"{v} 0" for v in xs)
    XR = "; ".join(f"{v} 248" for v in xs)
    KT = ";".join(str(round(v, 4)) for v in ks)
    SP = " ".join(["0.4 0 0.2 1"] * (len(xs) - 1))

    bop, bkt = ["0"], [0.0]
    for i in range(SHOTS):
        t0 = i * SLOT + 1.3
        bop += ["0", "1", "0.5", "0"]
        bkt += [kt(t0 - 0.06), kt(t0), kt(t0 + 0.22), kt(t0 + 0.42)]
    bop.append("0"); bkt.append(1.0)
    BOP = ";".join(bop)
    BKT = ";".join(str(round(v, 4)) for v in bkt)

    o.append('    <g>')
    o.append(f'      <animateTransform attributeName="transform" type="translate" values="{XV}" keyTimes="{KT}" dur="{DUR}s" repeatCount="indefinite" calcMode="spline" keySplines="{SP}"/>')
    o.append(f'      <rect x="-9" y="{GY-6}" width="18" height="{ROWS*PITCH+6}" fill="url(#beam)" opacity="0" filter="url(#blur6)">'
             f'<animate attributeName="opacity" values="{BOP}" keyTimes="{BKT}" dur="{DUR}s" repeatCount="indefinite"/></rect>')
    o.append(f'      <rect x="-2" y="{GY-6}" width="4" height="{ROWS*PITCH+130}" fill="url(#beam)" opacity="0">'
             f'<animate attributeName="opacity" values="{BOP}" keyTimes="{BKT}" dur="{DUR}s" repeatCount="indefinite"/></rect>')
    o.append('    </g>')

    o.append('    <g>')
    o.append(f'      <animateTransform attributeName="transform" type="translate" values="{XR}" keyTimes="{KT}" dur="{DUR}s" repeatCount="indefinite" calcMode="spline" keySplines="{SP}"/>')
    o.append('''      <g>
        <ellipse cx="0" cy="46" rx="26" ry="5" fill="#ffffff" opacity="0.20" filter="url(#blur3)"/>
        <path d="M-12 34 L0 52 L12 34Z" fill="#ffffff" opacity="0.35" filter="url(#blur3)">
          <animate attributeName="opacity" values="0.35;0.12;0.35" dur="0.5s" repeatCount="indefinite"/>
        </path>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.2s" repeatCount="indefinite"/>
          <rect x="-5" y="-46" width="10" height="16" rx="3" fill="#0d0d0d" stroke="#ffffff" stroke-opacity="0.7"/>
          <rect x="-2" y="-50" width="4" height="8" rx="2" fill="#ffffff"><animate attributeName="opacity" values="0.4;1;0.4" dur="0.9s" repeatCount="indefinite"/></rect>
          <rect x="-17" y="-30" width="34" height="24" rx="8" fill="#0a0a0a" stroke="url(#neon)" stroke-width="1.3"/>
          <rect x="-11" y="-24" width="8" height="8" rx="2" fill="#ffffff">
            <animate attributeName="height" values="8;1.5;8" keyTimes="0;0.5;1" dur="3.4s" repeatCount="indefinite"/>
            <animate attributeName="y" values="-24;-20.5;-24" keyTimes="0;0.5;1" dur="3.4s" repeatCount="indefinite"/>
          </rect>
          <rect x="3" y="-24" width="8" height="8" rx="2" fill="#ffffff">
            <animate attributeName="height" values="8;1.5;8" keyTimes="0;0.5;1" dur="3.4s" repeatCount="indefinite"/>
            <animate attributeName="y" values="-24;-20.5;-24" keyTimes="0;0.5;1" dur="3.4s" repeatCount="indefinite"/>
          </rect>
          <rect x="-21" y="-3" width="42" height="30" rx="9" fill="#0a0a0a" stroke="url(#neon)" stroke-width="1.3"/>
          <rect x="-13" y="4" width="26" height="4" rx="2" fill="#9a9a9a" opacity="0.75"/>
          <rect x="-13" y="12" width="17" height="4" rx="2" fill="#ffffff" opacity="0.8">
            <animate attributeName="width" values="6;26;12;20;6" dur="2.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="-30" y="1" width="8" height="18" rx="4" fill="#0d0d0d" stroke="#9a9a9a" stroke-opacity="0.6"/>
          <rect x="22" y="1" width="8" height="18" rx="4" fill="#0d0d0d" stroke="#9a9a9a" stroke-opacity="0.6"/>
          <path d="M-17 -30 L-17 -38" stroke="#9a9a9a" stroke-width="1.2"/>
          <circle cx="-17" cy="-40" r="2.4" fill="#9a9a9a"><animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite"/></circle>
        </g>
      </g>''')
    o.append('    </g>')

    o.append('    <path d="M44 292H624" stroke="#ffffff" stroke-opacity="0.16" stroke-dasharray="2 8"/>')
    o.append(f'    <text x="44" y="312" font-family="{FONT}" font-size="9.5" fill="#4d4d4d" letter-spacing="1.2">'
             f'UNIT_SK-01 // TARGETING BUSIEST WEEKS</text>')
    o.append(f'''    <g font-family="{FONT}" font-size="9" fill="#4d4d4d">
      <text x="452" y="312" letter-spacing="1">LESS</text>
      <rect x="486" y="304" width="8" height="8" rx="2" fill="{LEV[0]}"/>
      <rect x="498" y="304" width="8" height="8" rx="2" fill="{LEV[1]}"/>
      <rect x="510" y="304" width="8" height="8" rx="2" fill="{LEV[2]}"/>
      <rect x="522" y="304" width="8" height="8" rx="2" fill="{LEV[3]}"/>
      <rect x="534" y="304" width="8" height="8" rx="2" fill="{LEV[4]}"/>
      <text x="550" y="312" letter-spacing="1">MORE</text>
    </g>''')

    # HUD driven by real numbers
    total = meta["total"]
    tiers = [(0, "Getting Started"), (100, "Building Habits"), (300, "Consistent Builder"),
             (600, "Building Momentum"), (1000, "Shipping Regularly"), (2000, "Prolific")]
    lvl_name, lvl_i = tiers[0][1], 0
    for i, (thr, name) in enumerate(tiers):
        if total >= thr:
            lvl_name, lvl_i = name, i
    nxt = tiers[lvl_i + 1] if lvl_i + 1 < len(tiers) else None
    if nxt:
        lo = tiers[lvl_i][0]
        pct = max(0.0, min(1.0, (total - lo) / float(nxt[0] - lo)))
        nxt_label = f"NEXT {nxt[1].upper()} ({nxt[0]})"
    else:
        pct, nxt_label = 1.0, "MAX TIER"

    o.append(f'    <g font-family="{FONT}">')
    o.append('      <text x="660" y="118" font-size="9.5" fill="#4d4d4d" letter-spacing="2.4">CONTRIBUTIONS</text>')
    o.append(f'      <text x="660" y="146" font-size="26" font-weight="700" fill="#ffffff" letter-spacing="1">{total:,}</text>')
    o.append('      <text x="660" y="176" font-size="9.5" fill="#4d4d4d" letter-spacing="2.4">LEVEL</text>')
    o.append(f'      <text x="660" y="196" font-size="13" font-weight="700" fill="url(#neon)" letter-spacing="0.4">{esc(lvl_name)}</text>')
    o.append('      <text x="660" y="222" font-size="9.5" fill="#4d4d4d" letter-spacing="2.4">XP</text>')
    o.append('      <rect x="660" y="230" width="176" height="9" rx="4.5" fill="#ffffff" fill-opacity="0.06"/>')
    o.append(f'      <rect x="660" y="230" width="{round(176*pct,1)}" height="9" rx="4.5" fill="url(#xp)">'
             f'<animate attributeName="width" values="0;{round(176*pct,1)}" dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1"/></rect>')
    # pin the width so a wider monospace fallback cannot run into the XP label
    nxt_w = min(136.0, round(len(nxt_label) * (8.5 * 0.62 + 0.6), 1))
    o.append(f'      <text x="836" y="222" text-anchor="end" font-size="8.5" fill="#a0a0a0" '
             f'letter-spacing="0.6" textLength="{nxt_w}" lengthAdjust="spacingAndGlyphs">{nxt_label}</text>')
    o.append(f'''      <g transform="translate(660,256)">
        <rect width="84" height="40" rx="10" fill="#ffffff" fill-opacity="0.045" stroke="#ffffff" stroke-opacity="0.22"/>
        <text x="12" y="17" font-size="8.5" fill="#4d4d4d" letter-spacing="1.6">STREAK</text>
        <text x="12" y="32" font-size="13" font-weight="700" fill="#ffffff">{cur} day{"" if cur == 1 else "s"}</text>
        <rect x="92" width="84" height="40" rx="10" fill="#ffffff" fill-opacity="0.045" stroke="#9a9a9a" stroke-opacity="0.22"/>
        <text x="104" y="17" font-size="8.5" fill="#4d4d4d" letter-spacing="1.6">BEST</text>
        <text x="104" y="32" font-size="13" font-weight="700" fill="#c9c9c9">{longest} day{"" if longest == 1 else "s"}</text>
      </g>''')
    o.append('    </g>')
    o.append(frame_close(W, H))
    return "\n".join(o)


# ---------------------------------------------------------------------- analytics
def render_analytics(days, meta, cur, longest):
    W, H = 880, 300
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'fill="none" role="img" aria-label="GitHub analytics">']
    o.append(defs(W, H, '''    <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
'''))
    o.append(frame_open(W, H))
    o.append('    <ellipse cx="60" cy="0" rx="260" ry="120" fill="url(#gA)"/>')
    o.append('    <ellipse cx="820" cy="300" rx="260" ry="130" fill="url(#gB)"/>')

    today_iso = date.today().isoformat()
    past = [d for d in days if d["date"] <= today_iso]
    active = sum(1 for d in past if d["count"] > 0)
    best_day = max((d["count"] for d in past), default=0)
    tiles = [
        ("CONTRIBUTIONS", f'{meta["total"]:,}', "PAST 12 MONTHS"),
        ("CURRENT STREAK", f'{cur}', "DAY" + ("" if cur == 1 else "S")),
        ("LONGEST STREAK", f'{longest}', "DAY" + ("" if longest == 1 else "S")),
        ("ACTIVE DAYS", f'{active}', "WITH AT LEAST ONE"),
        ("BEST DAY", f'{best_day}', "IN A SINGLE DAY"),
    ]
    tw, gap = 160, 8
    o.append(f'    <g font-family="{FONT}">')
    for i, (label, value, sub) in enumerate(tiles):
        x = 24 + i * (tw + gap)
        o.append(f'      <g>')
        o.append(f'        <rect x="{x}" y="24" width="{tw}" height="100" rx="14" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.13"/>')
        o.append(f'        <text x="{x+16}" y="46" font-size="8.5" fill="#4d4d4d" letter-spacing="1.6">{label}</text>')
        o.append(f'        <text x="{x+16}" y="82" font-size="26" font-weight="700" fill="#ffffff" letter-spacing="0.5">{value}</text>')
        o.append(f'        <text x="{x+16}" y="102" font-size="8" fill="#6e6e6e" letter-spacing="1.2">{sub}</text>')
        o.append(f'        <rect x="{x+16}" y="110" width="0" height="2" rx="1" fill="#ffffff" opacity="0.5">'
                 f'<animate attributeName="width" values="0;{tw-32}" dur="1.2s" begin="{round(0.15*i,2)}s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1"/></rect>')
        o.append('      </g>')
    o.append('    </g>')

    # 90-day sparkline
    today = date.today().isoformat()
    recent = [d for d in days if d["date"] <= today][-90:]
    vals = [d["count"] for d in recent] or [0]
    peak = max(vals) or 1
    PX, PY, PW, PH = 24, 140, 832, 136
    o.append(f'    <rect x="{PX}" y="{PY}" width="{PW}" height="{PH}" rx="14" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.13"/>')
    o.append(f'    <g font-family="{FONT}">')
    o.append(f'      <text x="{PX+18}" y="{PY+24}" font-size="8.5" fill="#4d4d4d" letter-spacing="1.8">LAST 90 DAYS</text>')
    o.append(f'      <text x="{PX+PW-18}" y="{PY+24}" text-anchor="end" font-size="8.5" fill="#6e6e6e" letter-spacing="1.2">PEAK {peak} IN A DAY</text>')
    o.append('    </g>')

    gx0, gy0 = PX + 18, PY + 36
    gw, gh = PW - 36, PH - 62
    n = len(vals)
    step = gw / max(1, n - 1)
    pts = [(gx0 + i * step, gy0 + gh - (v / peak) * gh) for i, v in enumerate(vals)]
    line = " ".join(f"{'M' if i == 0 else 'L'}{round(x,1)} {round(y,1)}" for i, (x, y) in enumerate(pts))
    area = line + f" L{round(pts[-1][0],1)} {gy0+gh} L{round(pts[0][0],1)} {gy0+gh} Z"
    for f in (0.0, 0.5, 1.0):
        yy = round(gy0 + gh * f, 1)
        o.append(f'    <path d="M{gx0} {yy}H{gx0+gw}" stroke="#ffffff" stroke-opacity="0.06"/>')
    o.append(f'    <path d="{area}" fill="url(#spark)"/>')
    o.append(f'    <path d="{line}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>')
    peak_i = vals.index(peak)
    o.append(f'    <circle cx="{round(pts[peak_i][0],1)}" cy="{round(pts[peak_i][1],1)}" r="3" fill="#ffffff"/>')
    o.append(f'    <circle cx="{round(pts[peak_i][0],1)}" cy="{round(pts[peak_i][1],1)}" r="3" fill="none" stroke="#ffffff">'
             f'<animate attributeName="r" values="3;12" dur="2.2s" repeatCount="indefinite"/>'
             f'<animate attributeName="stroke-opacity" values="0.8;0" dur="2.2s" repeatCount="indefinite"/></circle>')
    if recent:
        o.append(f'    <g font-family="{FONT}" font-size="8" fill="#4d4d4d">')
        o.append(f'      <text x="{gx0}" y="{gy0+gh+16}">{recent[0]["date"]}</text>')
        o.append(f'      <text x="{gx0+gw}" y="{gy0+gh+16}" text-anchor="end">{recent[-1]["date"]}</text>')
        o.append('    </g>')
    o.append(frame_close(W, H))
    return "\n".join(o)


# ---------------------------------------------------------------------- languages
def render_languages(meta):
    langs = meta["languages"]
    pending = not langs
    W, H = 880, (108 if pending else 216)
    shades = ["#ffffff", "#d4d4d4", "#ababab", "#8a8a8a", "#6e6e6e", "#565656", "#3d3d3d"]
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'fill="none" role="img" aria-label="Language distribution">']
    o.append(defs(W, H))
    o.append(frame_open(W, H))
    o.append('    <ellipse cx="440" cy="0" rx="320" ry="110" fill="url(#gA)"/>')
    sub = ("AWAITING FIRST SYNC — RUN THE UPDATE WORKFLOW" if pending
           else "BY BYTES ACROSS OWNED REPOSITORIES")
    o.append(f'''    <g font-family="{FONT}">
      <text x="28" y="34" font-size="15" font-weight="700" fill="url(#neon)" letter-spacing="3">LANGUAGE DISTRIBUTION</text>
      <text x="28" y="50" font-size="9" fill="#4d4d4d" letter-spacing="1.5">{sub}</text>
    </g>''')

    BX, BY, BW, BH = 28, 66, 824, 18
    o.append(f'    <rect x="{BX}" y="{BY}" width="{BW}" height="{BH}" rx="9" fill="#ffffff" fill-opacity="0.05"/>')
    total_pct = sum(p for _, p in langs) or 100.0
    cx = BX
    o.append(f'    <g>')
    for i, (name, pct) in enumerate(langs):
        seg = BW * (pct / total_pct)
        if seg < 1:
            continue
        o.append(f'      <rect x="{round(cx,1)}" y="{BY}" width="{round(seg,1)}" height="{BH}" '
                 f'fill="{shades[i % len(shades)]}" opacity="0.9">'
                 f'<animate attributeName="height" values="0;{BH}" dur="0.7s" begin="{round(0.1*i,2)}s" fill="freeze"/>'
                 f'<animate attributeName="y" values="{BY+BH};{BY}" dur="0.7s" begin="{round(0.1*i,2)}s" fill="freeze"/></rect>')
        cx += seg
    o.append('    </g>')
    o.append(f'    <rect x="{BX}" y="{BY}" width="{BW}" height="{BH}" rx="9" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>')

    cols, cw = 3, 274
    o.append(f'    <g font-family="{FONT}">')
    for i, (name, pct) in enumerate(langs[:6]):
        r, c = divmod(i, cols)
        x = 28 + c * cw
        y = 116 + r * 42
        o.append(f'      <g opacity="0.55"><animate attributeName="opacity" values="0.55;1" dur="0.6s" begin="{round(0.12*i,2)}s" fill="freeze"/>')
        o.append(f'        <rect x="{x}" y="{y}" width="{cw-16}" height="32" rx="10" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.10"/>')
        o.append(f'        <circle cx="{x+16}" cy="{y+16}" r="4" fill="{shades[i % len(shades)]}"/>')
        o.append(f'        <text x="{x+28}" y="{y+20}" font-size="10.5" fill="#e5e5e5">{esc(name)}</text>')
        o.append(f'        <text x="{x+cw-30}" y="{y+20}" text-anchor="end" font-size="10.5" font-weight="700" fill="#a0a0a0">{pct}%</text>')
        o.append('      </g>')
    o.append('    </g>')
    o.append(frame_close(W, H))
    return "\n".join(o)


# --------------------------------------------------------------------------- main
def main():
    try:
        user = fetch()
    except Exception as e:  # network/token trouble should not break the build
        print("fetch failed, using fallback:", e)
        user = None

    days = meta = None
    if user:
        days, meta = shape(user)
        print(f"live GraphQL data: {meta['total']} contributions, {len(days)} days")

    # Live scrape covers the no-token case, and repairs a live response that
    # came back with an empty calendar.
    if not days or not meta or meta.get("total", 0) == 0:
        try:
            got = scrape()
        except Exception as e:
            print("scrape failed:", e)
            got = None
        if got:
            s_days, s_total = got
            print(f"live scrape: {s_total} contributions, {len(s_days)} days")
            if meta:
                days, meta["total"] = s_days, s_total
            else:
                days = s_days
                meta = {"total": s_total, "commits": 0, "prs": 0, "issues": 0,
                        "reviews": 0, "repos": 0, "stars": 0, "followers": 0,
                        "languages": [], "placeholder": True}

    if not days:
        days, meta = fallback()
        print("live read unavailable - using captured seed calendar")
    else:
        # keep the offline seed current so a future failed run still shows truth
        try:
            seed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                     "contributions_seed.json")
            with open(seed_path, "w", encoding="utf-8") as f:
                json.dump({"days": days, "total": meta["total"],
                           "repos": meta.get("repos", 0),
                           "captured": date.today().isoformat()}, f)
        except Exception as e:
            print("seed refresh skipped:", e)

    cur, longest = streaks(days)
    print(f"streaks: current={cur} longest={longest}")

    outputs = {
        "commit-arcade.svg": render_arcade(days, meta, cur, longest),
        "analytics.svg": render_analytics(days, meta, cur, longest),
        "languages.svg": render_languages(meta),
    }
    os.makedirs(OUT, exist_ok=True)
    for name, svg in outputs.items():
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg)
        print("wrote", path, len(svg), "bytes")


if __name__ == "__main__":
    main()
