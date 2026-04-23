#!/usr/bin/env python3
"""Build tag-based theme clusters and exclude country names.

Usage:
    python3 script/cluster_themes.py
    python3 script/cluster_themes.py --input data/all_programs.json --output data/theme_clusters.json
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


THEME_KEYWORDS = {
    "Climate & Energy": {
        "climate", "adaptation", "mitigation", "renewable", "energy", "emissions", "transition", "cop", "decarbon", "net zero",
    },
    "Minerals & Industry": {
        "critical mineral", "critical minerals", "mineral", "mining", "battery", "rare earth", "lithium", "cobalt", "nickel", "supply chain",
    },
    "Geopolitics & Security": {
        "geopolit", "geoeconom", "security", "defence", "defense", "conflict", "strategy", "sahel", "terror", "war",
    },
    "Economy, Finance & Trade": {
        "econom", "finance", "trade", "investment", "debt", "market", "industrial", "infrastructure", "value chain",
    },
    "Governance & Institutions": {
        "governance", "policy", "institution", "regulation", "law", "democracy", "election", "state", "public sector",
    },
    "Technology & Digital": {
        "technology", "digital", "innovation", "ai", "cyber", "data", "platform", "connectivity", "telecom",
    },
    "Society & Development": {
        "society", "education", "health", "gender", "youth", "migration", "development", "food", "water", "human",
    },
}

TAG_CANONICAL_REPLACEMENTS = {
    "critical mineral": "critical minerals",
    "critical raw material": "critical minerals",
    "critical raw materials": "critical minerals",
    "geoeconomic": "geoeconomics",
    "geopolitical": "geopolitics",
    "policy brief": "policy briefs",
    "short analysis": "short analyses",
    "short analyses": "short analysis",
    "policy papers": "policy paper",
    "policy briefs": "policy brief",
    "briefing notes": "briefing note",
    "expert interviews": "expert interview",
    "data visualisations": "data visualisation",
    "data visualizations": "data visualisation",
    "podcasts": "podcast",
    "commentaries": "commentary",
    "reports": "report",
    "webpages": "webpage",
}

# Rules to convert noisy/variant tag phrases into readable, standard cluster labels.
TAG_STANDARDIZATION_RULES: List[Tuple[re.Pattern, str]] = [
    (re.compile(r"\b(critical\s+minerals?|critical\s+raw\s+materials?)\b"), "Critical Minerals"),
    (re.compile(r"\b(climate\s+adaptation)\b"), "Climate Adaptation"),
    (re.compile(r"\b(climate\s+mitigation)\b"), "Climate Mitigation"),
    (re.compile(r"\b(energy\s+transition|just\s+transition)\b"), "Energy Transition"),
    (re.compile(r"\b(renewable\s+energy|clean\s+energy)\b"), "Renewable Energy"),
    (re.compile(r"\b(geopolitics?|geoeconomics?)\b"), "Geopolitics & Geoeconomics"),
    (re.compile(r"\b(supply\s+chains?)\b"), "Supply Chain"),
    (re.compile(r"\b(policy\s+briefs?)\b"), "Policy Brief"),
    (re.compile(r"\b(policy\s+papers?)\b"), "Policy Paper"),
    (re.compile(r"\b(briefing\s+notes?)\b"), "Briefing Note"),
    (re.compile(r"\b(short\s+analys(?:is|es))\b"), "Short Analysis"),
    (re.compile(r"\b(expert\s+interviews?)\b"), "Expert Interview"),
    (re.compile(r"\b(data\s+visuali[sz]ations?)\b"), "Data Visualisation"),
    (re.compile(r"\b(governance|institutional\s+reform)\b"), "Governance"),
    (re.compile(r"\b(digital|digitalisation|digitisation)\b"), "Digital Transformation"),
    (re.compile(r"\b(artificial\s+intelligence|\bai\b)\b"), "Artificial Intelligence"),
    (re.compile(r"\b(cyber\s+security|cybersecurity)\b"), "Cybersecurity"),
    (re.compile(r"\b(trade|trade\s+policy)\b"), "Trade"),
    (re.compile(r"\b(finance|development\s+finance|climate\s+finance)\b"), "Finance"),
    (re.compile(r"\b(podcast|commentary|report|webpage)\b"), "Publication Format"),
]

NOISE_TAGS = {
    "apri",
    "africa policy research institute",
    "africa",
    "publication format",
}

COUNTRY_SEED = {
    "afghanistan", "albania", "algeria", "angola", "argentina", "armenia", "australia", "austria", "azerbaijan",
    "bahrain", "bangladesh", "belarus", "belgium", "benin", "bolivia", "bosnia", "botswana", "brazil", "bulgaria",
    "burkina faso", "burundi", "cabo verde", "cameroon", "canada", "chad", "chile", "china", "colombia", "comoros",
    "congo", "costa rica", "croatia", "cuba", "cyprus", "czechia", "denmark", "djibouti", "dominica", "ecuador",
    "egypt", "eritrea", "estonia", "eswatini", "ethiopia", "finland", "france", "gabon", "gambia", "georgia", "germany",
    "ghana", "greece", "guinea", "guinea bissau", "haiti", "hungary", "iceland", "india", "indonesia", "iran", "iraq",
    "ireland", "israel", "italy", "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kuwait", "kyrgyzstan", "laos",
    "latvia", "lebanon", "lesotho", "liberia", "libya", "lithuania", "luxembourg", "madagascar", "malawi", "malaysia",
    "mali", "malta", "mauritania", "mauritius", "mexico", "moldova", "mongolia", "montenegro", "morocco", "mozambique",
    "myanmar", "namibia", "nepal", "netherlands", "new zealand", "nicaragua", "niger", "nigeria", "norway", "oman",
    "pakistan", "panama", "paraguay", "peru", "philippines", "poland", "portugal", "qatar", "romania", "russia",
    "rwanda", "saudi arabia", "senegal", "serbia", "sierra leone", "singapore", "slovakia", "slovenia", "somalia",
    "south africa", "south korea", "spain", "sri lanka", "sudan", "suriname", "sweden", "switzerland", "syria", "taiwan",
    "tajikistan", "tanzania", "thailand", "togo", "tunisia", "turkey", "uganda", "ukraine", "united arab emirates",
    "united kingdom", "united states", "uruguay", "uzbekistan", "venezuela", "vietnam", "yemen", "zambia", "zimbabwe",
    "usa", "uk", "drc", "democratic republic of the congo",
}

STOP_WORDS = {
    "the", "and", "for", "with", "from", "over", "under", "into", "towards", "across", "apri", "africa",
}


@dataclass
class Cluster:
    label: str
    count: int = 0
    variants: Counter = field(default_factory=Counter)


def normalize_text(value: str) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"[\u2018\u2019]", "'", text)
    text = re.sub(r"[^a-z0-9\s\-']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return TAG_CANONICAL_REPLACEMENTS.get(text, text)


def to_readable_label(value: str) -> str:
    value = value.replace("&", " & ")
    value = re.sub(r"\s+", " ", value).strip()
    if not value:
        return value
    if value.isupper():
        return value
    return " ".join(part.capitalize() for part in value.split(" "))


def standardize_tag(tag: str) -> str:
    norm = normalize_text(tag)
    if not norm:
        return ""

    for pattern, canonical in TAG_STANDARDIZATION_RULES:
        if pattern.search(norm):
            return canonical

    # Default to readable format for terms not explicitly mapped.
    return to_readable_label(norm)


def split_tags(value) -> List[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if not value:
        return []
    return [v.strip() for v in re.split(r"[;,|]", str(value)) if v.strip()]


def parse_year(record: dict) -> int | None:
    pub_year = str(record.get("Publication Year", "")).strip()
    if re.fullmatch(r"\d{4}", pub_year):
        return int(pub_year)
    date_value = str(record.get("Date", "")).strip()
    if len(date_value) >= 4 and date_value[:4].isdigit():
        return int(date_value[:4])
    return None


def infer_tags(record: dict) -> List[str]:
    title = normalize_text(record.get("Title", ""))
    words = [w for w in title.split() if len(w) > 4 and w not in STOP_WORDS]
    inferred = [
        str(record.get("program", "")).strip(),
        str(record.get("Item Type", "")).strip(),
        str(record.get("Type", "")).strip(),
        *words[:4],
    ]
    return [t for t in inferred if t]


def build_country_lexicon(records: Iterable[dict]) -> set[str]:
    lex = set(COUNTRY_SEED)
    for record in records:
        countries = record.get("countries", [])
        for c in split_tags(countries):
            norm = normalize_text(c)
            if norm:
                lex.add(norm)
        raw_country = normalize_text(record.get("Country", ""))
        if raw_country:
            lex.add(raw_country)
    return lex


def is_country_tag(tag: str, country_lexicon: set[str]) -> bool:
    if tag in country_lexicon:
        return True
    compact = tag.replace("-", " ")
    return compact in country_lexicon


def theme_for_tag(tag: str) -> str:
    tag_norm = normalize_text(tag)
    best_theme = "Other / Emerging"
    best_score = 0

    for theme, keywords in THEME_KEYWORDS.items():
        score = sum(1 for k in keywords if k in tag_norm)
        if score > best_score:
            best_score = score
            best_theme = theme

    return best_theme


def similarity(a: str, b: str) -> float:
    if a == b:
        return 1.0
    sa = set(a.split())
    sb = set(b.split())
    jacc = len(sa & sb) / max(1, len(sa | sb))
    seq = SequenceMatcher(None, a, b).ratio()
    return (jacc * 0.45) + (seq * 0.55)


def cluster_terms(counter: Counter) -> List[dict]:
    clusters: List[Cluster] = []
    ordered = sorted(counter.items(), key=lambda x: x[1], reverse=True)

    for term, count in ordered:
        placed = False
        for c in clusters:
            if similarity(term.lower(), c.label.lower()) >= 0.86:
                c.count += count
                c.variants[term] += count
                if c.variants[c.label] < c.variants[term]:
                    c.label = term
                placed = True
                break

        if not placed:
            cl = Cluster(label=term, count=count)
            cl.variants[term] = count
            clusters.append(cl)

    out = []
    for c in sorted(clusters, key=lambda x: x.count, reverse=True):
        label = to_readable_label(c.label)
        out.append(
            {
                "label": label,
                "count": c.count,
                "variants": sorted(
                    [{"tag": to_readable_label(t), "count": n} for t, n in c.variants.items()],
                    key=lambda x: x["count"],
                    reverse=True,
                ),
            }
        )
    return out


def build_clusters(records: List[dict]) -> dict:
    country_lexicon = build_country_lexicon(records)
    excluded_country_tags = Counter()

    yearly_theme_terms: Dict[int, Dict[str, Counter]] = defaultdict(lambda: defaultdict(Counter))
    overall_theme_terms: Dict[str, Counter] = defaultdict(Counter)

    for r in records:
        year = parse_year(r)
        if year is None:
            continue

        tags = [
            *split_tags(r.get("Manual Tags", [])),
            *split_tags(r.get("Automatic Tags", "")),
        ]

        if not tags:
            tags = infer_tags(r)

        for raw_tag in tags:
            tag = normalize_text(raw_tag)
            if len(tag) < 3:
                continue
            if is_country_tag(tag, country_lexicon):
                excluded_country_tags[tag] += 1
                continue

            standardized = standardize_tag(tag)
            if not standardized:
                continue
            if normalize_text(standardized) in NOISE_TAGS:
                continue

            theme = theme_for_tag(standardized)
            yearly_theme_terms[year][theme][standardized] += 1
            overall_theme_terms[theme][standardized] += 1

    years = sorted(yearly_theme_terms.keys())
    by_year = {}

    for y in years:
        by_year[str(y)] = {
            theme: cluster_terms(counter)
            for theme, counter in sorted(yearly_theme_terms[y].items(), key=lambda x: x[0])
        }

    overall = {
        theme: cluster_terms(counter)
        for theme, counter in sorted(overall_theme_terms.items(), key=lambda x: x[0])
    }

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(records),
        "years": years,
        "excluded_country_tags": sorted(
            [{"tag": t, "count": c} for t, c in excluded_country_tags.items()],
            key=lambda x: x["count"],
            reverse=True,
        ),
        "themes_defined": list(THEME_KEYWORDS.keys()) + ["Other / Emerging"],
        "overall": overall,
        "by_year": by_year,
    }


def main() -> None:
    base_dir = Path(__file__).resolve().parents[1]
    default_input = base_dir / "data" / "all_programs.json"
    default_output = base_dir / "data" / "theme_clusters.json"

    parser = argparse.ArgumentParser(description="Cluster APRI tags into themes while excluding country names.")
    parser.add_argument("--input", default=str(default_input), help="Path to all_programs.json")
    parser.add_argument("--output", default=str(default_output), help="Path to output clustered JSON")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    with input_path.open("r", encoding="utf-8") as f:
        records = json.load(f)

    result = build_clusters(records)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ Theme clusters written to: {output_path}")
    print(f"   Records processed: {result['total_records']}")
    print(f"   Years covered: {len(result['years'])}")
    print(f"   Excluded country-like tags: {len(result['excluded_country_tags'])}")


if __name__ == "__main__":
    main()
