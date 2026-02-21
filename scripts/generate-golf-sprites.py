#!/usr/bin/env python3
import argparse
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

from google import genai
from google.genai.types import GenerateContentConfig
from PIL import Image
from io import BytesIO

REPO_ROOT = Path(__file__).resolve().parents[1]
PROMPTS_PATH = REPO_ROOT / "src" / "docs" / "iso-golf-sprite-prompts.md"
MANIFEST_PATH = REPO_ROOT / "public" / "assets" / "golf" / "parts" / "manifest.json"
OUTPUT_DIR = REPO_ROOT / "public" / "assets" / "golf" / "parts"

TERRAIN_KEYS = {
    "fairway",
    "green",
    "tee",
    "rough",
    "sand",
    "water",
    "cart_path",
}

SEAMLESS_HINT = "seamless tileable, no visible seams when repeated"


@dataclass
class SpritePrompt:
    name: str
    prompt: str


def load_manifest(path: Path) -> Tuple[Dict[str, int], Dict[str, str]]:
    if not path.exists():
        return {}, {}
    data = json.loads(path.read_text(encoding="utf-8"))
    variants = data.get("variants", {}) or {}
    prompt_overrides = data.get("prompt_overrides", {}) or {}
    return variants, prompt_overrides


def parse_prompts(path: Path) -> Dict[str, SpritePrompt]:
    text = path.read_text(encoding="utf-8")
    filename_re = re.compile(r"^Filename:\s*`([^`]+)`\s*$", re.IGNORECASE)
    prompt_re = re.compile(r'^Prompt:\s*"(.*)"\s*$')

    prompts: Dict[str, SpritePrompt] = {}
    lines = text.splitlines()
    current_name = None

    for line in lines:
        filename_match = filename_re.match(line.strip())
        if filename_match:
            current_name = filename_match.group(1).replace(".png", "").strip()
            continue
        prompt_match = prompt_re.match(line.strip())
        if prompt_match and current_name:
            prompts[current_name] = SpritePrompt(
                name=current_name,
                prompt=prompt_match.group(1).strip(),
            )
            current_name = None
    return prompts


def extract_image_bytes(response) -> bytes:
    for candidate in response.candidates or []:
        content = getattr(candidate, "content", None)
        if not content:
            continue
        for part in getattr(content, "parts", []) or []:
            inline = getattr(part, "inline_data", None)
            if inline and getattr(inline, "data", None):
                return inline.data
            data = getattr(part, "data", None)
            if data:
                return data
    raise RuntimeError("No image bytes found in GenAI response")


def save_png(image_bytes: bytes, output_path: Path, size: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(BytesIO(image_bytes)).convert("RGBA")
    if img.size != (size, size):
        img = img.resize((size, size), resample=Image.LANCZOS)
    img.save(output_path, format="PNG")


def generate_image(client, model: str, prompt: str, retries: int, backoff: float) -> bytes:
    attempt = 0
    while True:
        try:
            response = client.models.generate_content(
                model=model,
                contents=[prompt],
                config=GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                ),
            )
            return extract_image_bytes(response)
        except Exception as exc:
            attempt += 1
            if attempt > retries:
                raise
            sleep_time = backoff * (2 ** (attempt - 1))
            print(f"Retrying after error: {exc} (attempt {attempt}/{retries})")
            time.sleep(sleep_time)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate IsoGolf sprite PNGs via Google GenAI.")
    parser.add_argument("--only", default="", help="Comma-separated list of sprite base names to generate")
    parser.add_argument("--size", type=int, default=128, help="Output size in pixels (square)")
    parser.add_argument("--retries", type=int, default=3, help="Retry count for API errors")
    parser.add_argument("--backoff", type=float, default=1.5, help="Base seconds for backoff")
    parser.add_argument("--dry-run", action="store_true", help="Print planned outputs without calling API")
    args = parser.parse_args()

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise SystemExit("GOOGLE_API_KEY is required for Google GenAI access.")

    prompts = parse_prompts(PROMPTS_PATH)
    variants_map, prompt_overrides = load_manifest(MANIFEST_PATH)

    only = {name.strip() for name in args.only.split(",") if name.strip()} if args.only else None

    planned_outputs: List[Tuple[str, Path, str]] = []
    for name, sprite in prompts.items():
        if only and name not in only:
            continue
        variant_count = int(variants_map.get(name, 1))
        variant_count = max(1, variant_count)

        base_prompt = prompt_overrides.get(name, sprite.prompt)
        if name in TERRAIN_KEYS:
            base_prompt = f"{base_prompt} {SEAMLESS_HINT}"

        planned_outputs.append((name, OUTPUT_DIR / f"{name}.png", base_prompt))
        if variant_count > 1:
            for idx in range(2, variant_count + 1):
                planned_outputs.append(
                    (name, OUTPUT_DIR / "variants" / name / f"v{idx}.png", base_prompt)
                )

    if args.dry_run:
        for _, out_path, _ in planned_outputs:
            print(out_path)
        return

    client = genai.Client(api_key=api_key)
    model = "gemini-2.5-flash-image"

    for name, out_path, prompt in planned_outputs:
        if out_path.exists():
            print(f"Skipping existing: {out_path}")
            continue
        print(f"Generating {out_path.name} ({name})")
        try:
            image_bytes = generate_image(client, model, prompt, args.retries, args.backoff)
            save_png(image_bytes, out_path, args.size)
        except Exception as exc:
            print(f"Failed to generate {out_path}: {exc}")


if __name__ == "__main__":
    main()
