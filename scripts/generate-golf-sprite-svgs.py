#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import random
from pathlib import Path
from typing import Dict, List

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO_ROOT / "public" / "assets" / "golf" / "parts"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

SIZE = 128

BASE_ORDER = [
    "fairway", "green", "tee", "rough", "sand", "water",
    "cart_path", "hole_flag", "golf_ball", "golfer_idle", "golfer_walk", "golfer_swing",
    "clubhouse_l1", "driving_range_l1", "maintenance_shed_l1", "practice_green_l1", "pro_shop_l1", "restaurant_l1",
    "clubhouse_l2", "driving_range_l2", "maintenance_shed_l2", "practice_green_l2", "pro_shop_l2", "restaurant_l2",
    "clubhouse_l3", "driving_range_l3", "maintenance_shed_l3", "practice_green_l3", "pro_shop_l3", "restaurant_l3",
]

TERRAIN_COLORS = {
    "fairway": "#6fbf62",
    "green": "#3a9c4a",
    "tee": "#7dd06a",
    "rough": "#4b8a41",
    "sand": "#e6c574",
    "water": "#4aa6d4",
    "cart_path": "#a29073",
}


def load_manifest(path: Path) -> Dict[str, int]:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    variants = data.get("variants", {}) or {}
    return {k: max(1, int(v)) for k, v in variants.items()}


def jitter_color(hex_color: str, amount: int) -> str:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    def clamp(x): return max(0, min(255, x))
    r = clamp(r + amount)
    g = clamp(g + amount)
    b = clamp(b + amount)
    return f"#{r:02x}{g:02x}{b:02x}"


def svg_header() -> List[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}" shape-rendering="crispEdges">',
        '<defs>',
        '<linearGradient id="baseShade" x1="0" y1="0" x2="0" y2="1">',
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>',
        '<stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>',
        '</linearGradient>',
        '</defs>',
    ]


def svg_footer() -> List[str]:
    return ['</svg>']


def tile_diamond(fill: str, stroke: str = "rgba(0,0,0,0.15)") -> List[str]:
    points = "64 16 112 40 64 64 16 40"
    return [
        '<ellipse cx="64" cy="70" rx="40" ry="10" fill="rgba(0,0,0,0.15)"/>',
        f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="1"/>',
        f'<polygon points="{points}" fill="url(#baseShade)" opacity="0.3"/>',
    ]


def draw_grass_stripes() -> List[str]:
    lines = []
    for i in range(5):
        x1 = 28 + i * 10
        y1 = 32 + i * 2
        x2 = 64 + i * 6
        y2 = 56 + i * 2
        lines.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>')
    return lines


def sprite_svg(name: str, variant_index: int = 1) -> str:
    base = name.split("__v")[0]
    seed = hash(f"{name}-{variant_index}") & 0xFFFFFFFF
    rng = random.Random(seed)

    lines = []
    lines.extend(svg_header())

    if base in TERRAIN_COLORS:
        base_color = TERRAIN_COLORS[base]
        if variant_index > 1:
            base_color = jitter_color(base_color, rng.randint(-10, 10))
        lines.extend(tile_diamond(base_color))
        if base == "fairway":
            lines.extend(draw_grass_stripes())
        elif base == "green":
            lines.append('<circle cx="64" cy="44" r="18" fill="rgba(0,0,0,0.08)"/>')
            lines.append('<circle cx="64" cy="44" r="14" fill="rgba(255,255,255,0.10)"/>')
        elif base == "tee":
            lines.append('<rect x="52" y="34" width="24" height="8" fill="rgba(255,255,255,0.35)"/>')
        elif base == "rough":
            for i in range(10):
                x = 36 + rng.randint(0, 40)
                y = 30 + rng.randint(0, 24)
                lines.append(f'<circle cx="{x}" cy="{y}" r="2" fill="rgba(0,0,0,0.12)"/>')
        elif base == "sand":
            lines.append('<ellipse cx="64" cy="44" rx="20" ry="10" fill="rgba(0,0,0,0.08)"/>')
            for i in range(4):
                y = 38 + i * 4
                lines.append(f'<line x1="48" y1="{y}" x2="80" y2="{y+2}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>')
        elif base == "water":
            for i in range(3):
                y = 36 + i * 6
                lines.append(f'<path d="M32 {y} Q64 {y-4} 96 {y}" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none"/>')
        elif base == "cart_path":
            lines.append('<path d="M40 40 L88 54" stroke="#6f5a43" stroke-width="8" stroke-linecap="round"/>')
        lines.extend(svg_footer())
        return "\n".join(lines)

    # Objects and characters
    if base == "hole_flag":
        lines.extend(tile_diamond(TERRAIN_COLORS["green"]))
        lines.append('<line x1="62" y1="18" x2="62" y2="40" stroke="#333" stroke-width="2"/>')
        lines.append('<polygon points="62 18 76 22 62 26" fill="#e11d48"/>')
        lines.append('<circle cx="62" cy="46" r="3" fill="rgba(0,0,0,0.2)"/>')
    elif base == "golf_ball":
        lines.append('<circle cx="64" cy="56" r="6" fill="#f8fafc" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>')
        lines.append('<circle cx="60" cy="54" r="1.5" fill="rgba(0,0,0,0.12)"/>')
    elif base.startswith("golfer_"):
        lines.append('<ellipse cx="64" cy="70" rx="16" ry="6" fill="rgba(0,0,0,0.2)"/>')
        lines.append('<circle cx="64" cy="36" r="6" fill="#f2c9a0"/>')
        lines.append('<rect x="58" y="42" width="12" height="18" rx="3" fill="#1f2937"/>')
        if base == "golfer_walk":
            lines.append('<line x1="60" y1="60" x2="52" y2="74" stroke="#111827" stroke-width="3"/>')
            lines.append('<line x1="68" y1="60" x2="76" y2="72" stroke="#111827" stroke-width="3"/>')
        elif base == "golfer_swing":
            lines.append('<line x1="58" y1="50" x2="80" y2="30" stroke="#111827" stroke-width="3"/>')
        else:
            lines.append('<line x1="58" y1="50" x2="48" y2="60" stroke="#111827" stroke-width="3"/>')
    else:
        # Facilities: simple building on tile
        lines.extend(tile_diamond(TERRAIN_COLORS["green"]))
        roof = "#9ca3af"
        body = "#6b7280"
        accent = "#4b5563"
        if "clubhouse" in base:
            roof = "#a16207"
            body = "#d6a86a"
        elif "restaurant" in base:
            roof = "#b91c1c"
            body = "#f87171"
        elif "pro_shop" in base:
            roof = "#2563eb"
            body = "#93c5fd"
        elif "maintenance" in base:
            roof = "#374151"
            body = "#9ca3af"
        elif "driving_range" in base:
            roof = "#065f46"
            body = "#6ee7b7"
        elif "practice_green" in base:
            roof = "#047857"
            body = "#86efac"

        level = 1
        if base.endswith("_l2"):
            level = 2
        elif base.endswith("_l3"):
            level = 3
        height = 16 + level * 4
        lines.append(f'<rect x="44" y="{48 - height}" width="40" height="{height}" rx="3" fill="{body}"/>')
        lines.append(f'<polygon points="44 {48 - height} 64 {36 - height} 84 {48 - height}" fill="{roof}"/>')
        lines.append(f'<rect x="50" y="{48 - height + 6}" width="10" height="10" fill="{accent}"/>')

    lines.extend(svg_footer())
    return "\n".join(lines)


def write_sprite(name: str, output_path: Path, variant_index: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    svg = sprite_svg(name, variant_index)
    output_path.write_text(svg, encoding="utf-8")


def main() -> None:
    variants_map = load_manifest(MANIFEST_PATH)

    for base in BASE_ORDER:
        count = max(1, int(variants_map.get(base, 1)))
        write_sprite(base, OUTPUT_DIR / f"{base}.svg", 1)
        if count > 1:
            for idx in range(2, count + 1):
                write_sprite(base, OUTPUT_DIR / "variants" / base / f"v{idx}.svg", idx)

    print(f"Generated SVGs in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
