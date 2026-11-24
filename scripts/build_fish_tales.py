"""Import the supplied species profiles and build static Fish Tales pages.

Run with --import-zip PATH to import the source presentations. A clean checkout
can rebuild the pages without the ZIP by running this script without arguments.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import posixpath
import re
import struct
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "gui/data/fish_tales.json"
ASSETS = ROOT / "gui/assets/fish_tales"
INDEX = ROOT / "gui/index.html"
NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
}
SECTION_NAMES = {
    "appearance": "appearance",
    "biology": "biology",
    "diet": "diet",
    "role in hudson river ecosystem": "ecosystem",
    "why is it important to monitor this species": "monitoring",
    "why do we monitor it?": "monitoring",
}
SECTION_TITLES = {
    "appearance": "Appearance",
    "biology": "Life history",
    "diet": "Diet",
    "ecosystem": "Role in the Hudson",
    "monitoring": "Why we monitor",
}

# Repair spelling/punctuation and two Atlantic Sturgeon statements verified
# against NYSDEC. Original statements and the reference remain in the JSON.
REPAIRS = {
    "Ameriurus catus": "Ameiurus catus",
    "Deep and laterally compressed body. Can grow up to 22 inch Silvery-white with two dorsal fins slightly joined by a membrane":
        "Deep, laterally compressed body. Can grow up to 22 inches. Silvery-white, with two dorsal fins slightly joined by a membrane.",
    "In the Hudson River, can be up to 5-6ft in length": "Can reach 14 feet in length",
    "Reproduce in rivers every 2-5 years during the spring": "Adults return to the Hudson River to spawn in May and June",
}


def clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return REPAIRS.get(text, text)


def image_dimensions(data: bytes) -> tuple[int, int]:
    """Read PNG or JPEG dimensions without a third-party build dependency."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return struct.unpack(">II", data[16:24])
    if data.startswith(b"\xff\xd8"):
        stream = io.BytesIO(data)
        stream.seek(2)
        while stream.tell() < len(data):
            if stream.read(1) != b"\xff":
                continue
            marker = stream.read(1)
            while marker == b"\xff":
                marker = stream.read(1)
            if not marker or marker[0] in (0xD9, 0xDA):
                break
            if marker[0] in (0x01, *range(0xD0, 0xD8)):
                continue
            size_bytes = stream.read(2)
            if len(size_bytes) != 2:
                break
            size = struct.unpack(">H", size_bytes)[0]
            if marker[0] in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                _, height, width = struct.unpack(">BHH", stream.read(5))
                return width, height
            stream.seek(size - 2, 1)
    raise ValueError("The supplied image must be PNG or JPEG")


def import_profiles(source: Path) -> dict:
    profiles = []
    corrections = []
    ASSETS.mkdir(parents=True, exist_ok=True)
    with ZipFile(source) as outer:
        for source_name in sorted(outer.namelist()):
            match = re.fullmatch(r"Species profiles/HRBMP_species_profile_template_([a-z_]+)\.pptx", source_name)
            if not match:
                continue
            slug = match.group(1).replace("_", "-")
            source_bytes = outer.read(source_name)
            with ZipFile(io.BytesIO(source_bytes)) as deck:
                slide_names = [name for name in deck.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)]
                if slide_names != ["ppt/slides/slide1.xml"]:
                    raise ValueError(f"Expected one species-profile slide: {source_name}")
                slide = ET.fromstring(deck.read(slide_names[0]))
                blocks = []
                for shape in slide.findall(".//p:sp", NS):
                    paragraphs = [
                        re.sub(r"\s+", " ", "".join(node.text or "" for node in paragraph.findall(".//a:t", NS))).strip()
                        for paragraph in shape.findall(".//a:p", NS)
                    ]
                    paragraphs = [text for text in paragraphs if text and not re.fullmatch(r"[_~\-]+", text)]
                    if paragraphs:
                        blocks.append(paragraphs)
                common_name, source_scientific_name = blocks[0][:2]
                scientific_name = clean(source_scientific_name)
                sections = {}
                credit = None
                for block in blocks[1:]:
                    heading = block[0].lower()
                    section = "fact" if heading.startswith("did you know") else SECTION_NAMES.get(heading)
                    if section:
                        content = []
                        for original in block[1:]:
                            text = clean(original)
                            if text != original:
                                corrections.append({"species": slug, "original": original, "display": text})
                            if "\ufffd" in text:
                                raise ValueError(f"Unresolved export character in {slug}: {text}")
                            if text:
                                content.append(text)
                        sections[section] = content
                    elif block[0].startswith(("Photo:", "Illustration:")):
                        credit = " ".join(block)
                if set(sections) != {"appearance", "biology", "diet", "ecosystem", "monitoring", "fact"}:
                    raise ValueError(f"Incomplete biology sections: {slug}")
                if scientific_name != source_scientific_name:
                    corrections.append({"species": slug, "original": source_scientific_name, "display": scientific_name})
                pictures = slide.findall(".//p:pic", NS)
                if len(pictures) != 1:
                    raise ValueError(f"Expected one original fish image: {slug}")
                picture = pictures[0]
                embed = picture.find(".//a:blip", NS).get(f"{{{NS['r']}}}embed")
                relationships = ET.fromstring(deck.read("ppt/slides/_rels/slide1.xml.rels"))
                relationship = next(item for item in relationships if item.get("Id") == embed)
                image_member = posixpath.normpath(posixpath.join("ppt/slides", relationship.get("Target")))
                if not image_member.startswith("ppt/media/") or relationship.get("TargetMode") == "External":
                    raise ValueError(f"Expected a safely embedded image: {slug}")
                image_bytes = deck.read(image_member)
                width, height = image_dimensions(image_bytes)
                suffix = ".png" if image_bytes.startswith(b"\x89PNG") else ".jpg"
                image_name = slug + suffix
                (ASSETS / image_name).write_bytes(image_bytes)
                metadata = picture.find("./p:nvPicPr/p:cNvPr", NS)
                source_alt = metadata.get("descr", "") if metadata is not None else ""
                if source_alt == "undefined":
                    source_alt = ""
                crop_element = picture.find(".//a:srcRect", NS)
                crop = {edge: int(crop_element.get(edge, "0")) / 100000 if crop_element is not None else 0
                        for edge in ("l", "t", "r", "b")}
                profiles.append({
                    "slug": slug,
                    "common_name": common_name,
                    "scientific_name": scientific_name,
                    "source_scientific_name": source_scientific_name,
                    "sections": sections,
                    "image": {
                        "src": f"assets/fish_tales/{image_name}",
                        "width": width,
                        "height": height,
                        "credit": credit,
                        "source_alt": source_alt,
                        "source_crop": crop,
                        "sha256": hashlib.sha256(image_bytes).hexdigest(),
                    },
                    "source": {"file": posixpath.basename(source_name), "sha256": hashlib.sha256(source_bytes).hexdigest()},
                    **({"references": [{"label": "NYSDEC: Atlantic and Shortnose Sturgeon", "url": "https://dec.ny.gov/nature/animals-fish-plants/hudson-delaware-marine-fisheries/atlantic-and-shortnose-sturgeon"}]} if slug == "atlantic-sturgeon" else {}),
                })
    profiles.sort(key=lambda item: item["common_name"].casefold())
    if len(profiles) != 16 or len({item["slug"] for item in profiles}) != 16:
        raise ValueError("The supplied set must contain 16 distinct complete profiles")
    result = {
        "source_archive": source.name,
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "profiles": profiles,
        "editorial_repairs": corrections,
        "omitted_template_fields": ["Empty river-range map", "Empty HRBMP data-spotlight graph", "Optional QR-code footer"],
    }
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


def escaped(value: str) -> str:
    return html.escape(value, quote=True)


def photo(profile: dict, *, hero: bool = False) -> str:
    image = profile["image"]
    crop = image.get("source_crop", {edge: 0 for edge in ("l", "t", "r", "b")})
    visible_width = 1 - crop["l"] - crop["r"]
    visible_height = 1 - crop["t"] - crop["b"]
    if visible_width <= 0 or visible_height <= 0:
        raise ValueError(f"Invalid original photo framing: {profile['slug']}")
    ratio = image["width"] * visible_width / (image["height"] * visible_height)
    style = (
        f"--fish-aspect: {ratio:.6f}; "
        f"--fish-image-width: {100 / visible_width:.6f}%; "
        f"--fish-image-height: {100 / visible_height:.6f}%; "
        f"--fish-image-left: {-100 * crop['l'] / visible_width:.6f}%; "
        f"--fish-image-top: {-100 * crop['t'] / visible_height:.6f}%;"
    )
    title = f' title="{escaped(image["credit"])}"' if image.get("credit") else ""
    return (
        f'<div class="fish-photo-frame{" fish-photo-frame-hero" if hero else ""}">'
        f'<div class="fish-photo-window" style="{style}">'
        f'<img src="{escaped(image["src"])}" alt="{escaped(profile["common_name"])}" '
        f'width="{image["width"]}" height="{image["height"]}" loading="lazy" decoding="async"{title} />'
        '</div></div>'
    )


def directory(profiles: list[dict]) -> str:
    cards = []
    for profile in profiles:
        name = escaped(profile["common_name"])
        scientific = escaped(profile["scientific_name"])
        search = escaped(" ".join([profile["common_name"], profile["scientific_name"], profile["source_scientific_name"]]))
        cards.append(f'''          <a class="fish-tale-card" href="#fish-tale-{profile['slug']}" data-tab-link="fish-tale-{profile['slug']}" data-fish-tale-search="{search}">
            {photo(profile)}
            <div class="fish-tale-card-body">
              <h2>{name}</h2>
              <p class="fish-tale-scientific"><em>{scientific}</em></p>
              <p class="fish-tale-card-summary">{escaped(profile['sections']['ecosystem'][0])}</p>
              <span class="fish-tale-read">Read profile <span aria-hidden="true">&rarr;</span></span>
            </div>
          </a>''')
    return '''    <section class="tab-page fish-tales-directory" id="education-fish-tales" data-tab-page="education-fish-tales">
      <div class="page-header fish-tales-page-header">
        <div><p class="eyebrow">Educational Materials</p><h1 tabindex="-1">Fish Tales</h1></div>
        <div class="fish-tales-search">
          <label for="fish-tales-search">Find a species</label>
          <div class="fish-tales-search-controls">
            <input type="search" id="fish-tales-search" placeholder="Common or scientific name" autocomplete="off" aria-controls="fish-tales-grid" />
            <button type="button" id="fish-tales-clear" class="secondary-button" hidden>Clear search</button>
          </div>
        </div>
      </div>
      <p class="fish-tales-empty" id="fish-tales-empty" role="status" aria-live="polite" hidden>No matching species. Try another name.</p>
      <div class="fish-tales-grid" id="fish-tales-grid">
''' + "\n".join(cards) + '''
      </div>
    </section>
'''


def profile_page(profile: dict, previous: dict | None, following: dict | None) -> str:
    slug = profile["slug"]
    sections = profile["sections"]
    facts = "".join(f"<p>{escaped(text)}</p>" for text in sections["fact"])
    credit = profile["image"].get("credit")
    caption = f'\n            <figcaption>{escaped(credit)}</figcaption>' if credit else ""
    body = []
    for key, title in SECTION_TITLES.items():
        items = "\n".join(f"                <li>{escaped(text)}</li>" for text in sections[key])
        database_link = '''
              <a class="fish-profile-data-link" href="#biological-database" data-tab-link="biological-database">Explore the Biological Database <span aria-hidden="true">&rarr;</span></a>''' if key == "monitoring" else ""
        body.append(f'''          <section class="fish-profile-section{' fish-profile-monitoring' if key == 'monitoring' else ''}" aria-labelledby="{slug}-{key}-title">
            <h2 id="{slug}-{key}-title">{title}</h2>
            <ul>
{items}
            </ul>{database_link}
          </section>''')
    adjacent = []
    references = "".join(f'<a href="{escaped(ref["url"])}" target="_blank" rel="noopener">{escaped(ref["label"])}</a>' for ref in profile.get("references", []))
    references = f'<p class="fish-profile-references">Species reference: {references}</p>' if references else ""
    for other, label, side in [(previous, "Previous species", "previous"), (following, "Next species", "next")]:
        if other:
            adjacent.append(f'''          <a class="fish-profile-adjacent fish-profile-{side}" href="#fish-tale-{other['slug']}" data-tab-link="fish-tale-{other['slug']}"><span>{label}</span><strong>{escaped(other['common_name'])}</strong></a>''')
    return f'''    <section class="tab-page fish-profile-page" id="fish-tale-{slug}" data-tab-page="fish-tale-{slug}">
      <article class="fish-profile">
        <header class="fish-profile-header">
          <a class="fish-profile-back" href="#education-fish-tales" data-tab-link="education-fish-tales">&larr; Back to Fish Tales</a>
          <h1 tabindex="-1">{escaped(profile['common_name'])}</h1>
          <p class="fish-profile-scientific"><em>{escaped(profile['scientific_name'])}</em></p>
        </header>
        <div class="fish-profile-hero">
          <figure class="fish-profile-figure">
            {photo(profile, hero=True)}{caption}
          </figure>
          <aside class="fish-profile-fact" aria-labelledby="{slug}-fact-title">
            <span class="fish-profile-fact-rule" aria-hidden="true"></span>
            <h2 id="{slug}-fact-title">Did you know?</h2>
            {facts}
          </aside>
        </div>
        <div class="fish-profile-content">
{chr(10).join(body)}
        </div>
        {references}
        <nav class="fish-profile-pagination" aria-label="Browse species profiles">
{chr(10).join(adjacent)}
        </nav>
      </article>
    </section>
'''


def build(data: dict) -> None:
    profiles = data["profiles"]
    text = INDEX.read_text(encoding="utf-8")
    menu_start = text.index('<div class="nav-nested-submenu" aria-label="Fish Tales species">')
    menu_inner = text.index(">", menu_start) + 1
    menu_end = text.index("</div>", menu_inner)
    menu = "\n" + "\n".join(
        f'                <a href="#fish-tale-{p["slug"]}" data-tab-link="fish-tale-{p["slug"]}">{escaped(p["common_name"])}</a>'
        for p in profiles
    ) + "\n              "
    text = text[:menu_inner] + menu + text[menu_end:]
    start = text.index('    <section class="tab-page" id="education-fish-tales"') if '    <section class="tab-page" id="education-fish-tales"' in text else text.index('    <section class="tab-page fish-tales-directory"')
    end = text.index('    <section class="tab-page" id="education-history"', start)
    pages = directory(profiles) + "\n" + "\n".join(
        profile_page(profile, profiles[index - 1] if index > 0 else None, profiles[index + 1] if index + 1 < len(profiles) else None)
        for index, profile in enumerate(profiles)
    ) + "\n"
    text = text[:start] + pages + text[end:]
    stylesheet = '  <link rel="stylesheet" href="fish-tales.css?v=1.2.7" />'
    if 'href="fish-tales.css?' not in text:
        text = text.replace("</head>", stylesheet + "\n</head>")
    INDEX.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n", encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--import-zip", type=Path, help="Import an authorized species-profile ZIP before building")
    args = parser.parse_args()
    data = import_profiles(args.import_zip) if args.import_zip else json.loads(DATA.read_text(encoding="utf-8"))
    build(data)
    print(f"Built the Fish Tales directory and {len(data['profiles'])} complete species pages.")


if __name__ == "__main__":
    main()
