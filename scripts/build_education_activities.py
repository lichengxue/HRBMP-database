"""Import authorized activity sources and build the classroom activity pages.

Import once with --survey-deck PATH --matching-document PATH. Rebuild from the
checked-in JSON and original embedded images with no arguments (stdlib only).
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "gui/data/education_activities.json"
ASSETS = ROOT / "gui/assets/education_activities"
INDEX = ROOT / "gui/index.html"
NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main", "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def source(path: Path) -> dict:
    return {"filename": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def money(text: str) -> int:
    return int(re.search(r"\$([\d,]+)", text).group(1).replace(",", ""))


def import_sources(deck: Path, document: Path) -> dict:
    with ZipFile(deck) as z:
        names = sorted([n for n in z.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)], key=lambda n: int(re.search(r"slide(\d+)", n).group(1)))
        slides = [["".join(t.text or "" for t in p.findall(".//a:t", NS)).strip() for p in ET.fromstring(z.read(n)).findall(".//a:p", NS)] for n in names]
        slides = [[t for t in slide if t] for slide in slides]
    assert len(slides) == 19, "Review the import mapping if the supplied deck changes."
    objectives = []
    for i, s in enumerate(slides[3:8], 1):
        objectives.append({"id": str(i), "title": s[1], "budget": money(s[3]), "scenario": s[4].removeprefix("Scenario: "), "objective": s[s.index("PRIMARY OBJECTIVE") + 1], "clue": s[s.index("DESIGN CLUES") + 1], "discussion": s[s.index("DISCUSSION PROMPT") + 1].replace("it’s is", "it is")})
    areas = []
    for id_, label, detail in [("marsh", "MARSH / TRIBUTARY", "Shallow structured habitat"), ("lower", "LOWER ESTUARY", "More marine influence"), ("mid", "MID-HUDSON", "Estuarine transition"), ("upper", "UPPER HUDSON", "More freshwater influence")]:
        s = slides[8]
        areas.append({"id": id_, "name": label.title().replace(" / ", " / "), "description": detail, "cost": money(s[s.index(label) + 2])})
    gear = []
    for id_, label in [("trawl", "BOTTOM TRAWL"), ("seine", "BEACH SEINE"), ("traps", "CRAB TRAPS"), ("rod", "ROD AND REEL"), ("video", "BAITED REMOTE UNDERWATER VIDEO"), ("edna", "eDNA SAMPLE")]:
        s = slides[11]
        i = s.index(label)
        gear.append({"id": id_, "name": label.title() if id_ != "edna" else "eDNA sample", "cost": money(s[i+1]), "unit": s[i+1].split(" / ", 1)[1], "description": s[i+2], "limitation": s[i+3]})
    # Costs and charging units come from slide 13. Habitat is a one-time station
    # cost; sex/maturity is per specimen, not per gear deployment.
    measure = [{"id": i, "name": n, "cost": c, "basis": b} for i, n, c, b in [
        ("size", "Length and weight", 150, "station_visit"), ("temperature", "Temperature", 50, "station_visit"),
        ("salinity", "Salinity", 50, "station_visit"), ("oxygen", "Dissolved oxygen", 50, "station_visit"),
        ("habitat", "Habitat type", 150, "station"), ("maturity", "Sex and maturity", 150, "specimen")]]
    for m in measure:
        assert f"${m['cost']} / {'station-visit' if m['basis'] == 'station_visit' else 'station' if m['basis'] == 'station' else 'sample'}" in slides[12]
    data = {"sources": [source(deck), source(document)], "survey": {"objectives": objectives, "areas": areas, "gear": gear, "measurements": measure,
        "schedules": [{"id": "once", "name": "One visit", "visits": 1}, {"id": "spring-fall", "name": "Spring + fall", "visits": 2}, {"id": "biannual", "name": "Biannually (twice a year)", "visits": 2}, {"id": "monthly", "name": "Monthly × 12", "visits": 12}],
        "discussion": slides[18][2::2], "source_slides": [{"slide": i+1, "text": s} for i, s in enumerate(slides)]},
        "matching": {"answer_key": None, "adults": [], "juveniles": []}}
    ASSETS.mkdir(parents=True, exist_ok=True)
    with ZipFile(document) as z:
        def image(part: str, filename: str) -> dict:
            raw = z.read("word/media/" + part)
            (ASSETS / filename).write_bytes(raw)
            return {"path": "assets/education_activities/" + filename, "source_part": "word/media/" + part, "sha256": hashlib.sha256(raw).hexdigest()}
        for id_, name, part in [("bay-anchovy", "Bay Anchovy", "image4.png"), ("striped-bass", "Striped Bass", "image8.png"), ("windowpane-flounder", "Windowpane Flounder", "image2.png"), ("atlantic-tomcod", "Atlantic Tomcod", "image1.png"), ("white-catfish", "White Catfish", "image3.png")]:
            data["matching"]["adults"].append({"id": id_, "name": name, "image": image(part, "adult-" + id_ + Path(part).suffix)})
        for letter, part in zip("ABCDE", ["image5.jpg", "image10.jpg", "image6.jpg", "image7.jpg", "image9.jpg"]):
            data["matching"]["juveniles"].append({"letter": letter, "image": image(part, "juvenile-" + letter.lower() + ".jpg")})
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return data


def e(text: object) -> str:
    return html.escape(str(text), quote=True)


def classroom() -> str:
    return '''    <section class="tab-page education-activities-directory" id="education-classroom" data-tab-page="education-classroom">
      <div class="page-header"><p class="eyebrow">Educational Materials</p><h1>Classroom Activities</h1></div>
      <div class="learning-activity-grid">
        <a class="learning-activity-card" href="#activity-survey-design" data-tab-link="activity-survey-design">
          <div class="activity-card-art survey-card-art" aria-hidden="true"><span class="survey-art-river"></span><span class="survey-art-dot"></span><span class="survey-art-dot"></span><span class="survey-art-dot"></span></div>
          <div class="activity-card-body"><span class="resource-kicker">Design &amp; discovery</span><h2>Hudson River Survey Design Challenge</h2><p>Take the role of a fisheries science team. Design a survey, balance the budget, and defend your choices.</p><span class="activity-card-action">Build your survey &rarr;</span></div>
        </a>
        <a class="learning-activity-card" href="#activity-match-fish" data-tab-link="activity-match-fish">
          <div class="activity-card-art match-card-art" aria-hidden="true"><img src="assets/education_activities/juvenile-c.jpg" alt="" /><span>?</span><img src="assets/education_activities/juvenile-b.jpg" alt="" /></div>
          <div class="activity-card-body"><span class="resource-kicker">Observe &amp; compare</span><h2>Match the Young Fish to the Adult</h2><p>Look closely at five young Hudson River fishes. Which adult does each one become?</p><span class="activity-card-action">Start matching &rarr;</span></div>
        </a>
      </div>
      <a class="activity-resource-link" href="#education-fish-tales" data-tab-link="education-fish-tales">Explore species profiles in Fish Tales &rarr;</a>
      <a class="activity-resource-link supplementary-directory-link" href="#education-supplementary" data-tab-link="education-supplementary">Supplementary Materials: PDF slides and PowerPoint downloads &rarr;</a>
    </section>
'''


def survey_page(data: dict) -> str:
    s = data["survey"]
    objectives = "\n".join(f'<option value="{o["id"]}">{e(o["title"])} — ${o["budget"]:,}</option>' for o in s["objectives"])
    areas = "\n".join(f'''<label class="survey-area"><span><strong>{e(a['name'])}</strong><small>{e(a['description'])}</small><small>${a['cost']:,} / station / visit</small></span><span class="survey-station-input"><input type="number" name="area-{a['id']}" min="0" max="100" step="1" value="0" aria-label="Stations in {e(a['name'])}" /><span>stations</span></span></label>''' for a in s["areas"])
    schedules = "\n".join(f'<option value="{t["id"]}">{e(t["name"])}</option>' for t in s["schedules"])
    gear = "\n".join(f'<option value="{g["id"]}">{e(g["name"])} — ${g["cost"]:,} / {e(g["unit"])}</option>' for g in s["gear"])
    bases = {"station_visit": "station-visit", "station": "station, once", "specimen": "specimen assessed"}
    measurements = "\n".join(f'<label class="survey-measurement"><input type="checkbox" name="measurement" value="{m["id"]}" /><span><strong>{e(m["name"])}</strong><small>${m["cost"]:,} / {bases[m["basis"]]}</small></span></label>' for m in s["measurements"])
    notes = "\n".join(f'<label>{e(label)}<textarea name="note-{key}" rows="3" placeholder="{e(prompt)}"></textarea></label>' for key, label, prompt in [
        ("question", "Our research question", "We are trying to determine…"), ("timing", "When and why", "Explain your season, frequency, and timing."), ("reason", "Why this design works", "Connect your locations, gear, and measurements to the objective."), ("strength", "The strongest part of our design", "What does your design do well?"), ("limitations", "Two limitations", "What might you miss, underestimate, or interpret cautiously?"), ("extra", "If we had $10,000 more", "What would you improve, and why?")])
    discussion = "".join(f'<li>{e(p)}</li>' for p in s["discussion"])
    return f'''    <section class="tab-page activity-page" id="activity-survey-design" data-tab-page="activity-survey-design">
      <header class="activity-page-header"><a href="#education-classroom" data-tab-link="education-classroom">&larr; Classroom Activities</a><h1 tabindex="-1">Hudson River Survey Design Challenge</h1><p>You are the fisheries science team. Build a survey that answers a real management question—and stays on budget.</p><a href="#education-supplementary" data-tab-link="education-supplementary">Read the background slides or download the challenge deck &rarr;</a></header>
      <p id="survey-load-status" role="status">Loading the activity…</p>
      <form id="survey-design-form" hidden>
        <div class="survey-layout"><div class="survey-decisions">
          <section class="activity-panel"><h2><span>1</span> Choose your question</h2><label for="survey-objective">Research objective</label><select id="survey-objective" name="objective">{objectives}</select><div id="survey-objective-detail" class="survey-objective-detail"></div></section>
          <section class="activity-panel"><h2><span>2</span> Choose your locations</h2><p>Set the number of stations in each area. You can sample more than one area.</p><div class="survey-areas">{areas}</div></section>
          <section class="activity-panel"><h2><span>3</span> Plan your visits and gear</h2><div class="survey-control-grid"><label>Sampling schedule<select name="schedule">{schedules}</select></label><label>Sampling method<select name="gear">{gear}</select></label><label>Gear repeats per station-visit<input name="repeats" type="number" min="1" max="100" step="1" value="1" /></label></div><p id="survey-gear-detail" class="survey-method-note"></p><p class="survey-unit-note">One station-visit means one visit to one station. Gear costs repeat at each station-visit.</p></section>
          <section class="activity-panel"><h2><span>4</span> Choose measurements</h2><p>Core catch or detection data come from your method. Add measurements that help answer your question.</p><div class="survey-measurements">{measurements}</div><label id="survey-specimens-label" hidden>Specimens assessed for sex and maturity per station-visit<input name="specimens" type="number" min="1" max="1000" step="1" value="1" /></label></section>
          <section class="activity-panel survey-explanation"><h2><span>5</span> Defend your design</h2><div class="survey-notes">{notes}</div><details><summary>Discussion after your presentations</summary><ol>{discussion}</ol></details></section>
        </div><aside class="activity-panel survey-budget" aria-labelledby="survey-budget-title"><h2 id="survey-budget-title">Your budget</h2><div id="survey-budget-summary" aria-live="polite" aria-atomic="true"></div><div id="survey-budget-lines"></div><p class="survey-budget-note">Classroom costs from the supplied challenge deck.</p><div class="activity-actions"><button type="button" id="survey-export">Save survey plan</button><button type="button" data-print-activity>Print plan</button><button type="reset" class="activity-button-secondary">Start over</button></div><p id="survey-save-status" role="status"></p></aside></div>
      </form>
      <a class="activity-resource-link" href="#education-fish-tales" data-tab-link="education-fish-tales">Use Fish Tales to inform your survey &rarr;</a>
    </section>
'''


def matching_page(data: dict) -> str:
    m = data["matching"]
    juveniles = "\n".join(f'<button type="button" class="juvenile-card" data-enlarge-image="{j["image"]["path"]}" data-image-label="Young fish {j["letter"]}" aria-label="Enlarge young fish {j["letter"]}"><span>{j["letter"]}</span><img src="{j["image"]["path"]}" alt="Young fish {j["letter"]}, photographed on a measurement grid" loading="lazy" /><small>Enlarge image</small></button>' for j in m["juveniles"])
    options = '<option value="">Choose a letter</option>' + "".join(f'<option value="{j["letter"]}">{j["letter"]}</option>' for j in m["juveniles"])
    adults = "\n".join(f'''<article class="adult-match-card"><div class="adult-match-photo"><img src="{a['image']['path']}" alt="Adult {e(a['name'])}" loading="lazy" /></div><div class="adult-match-body"><h2>{e(a['name'])}</h2><label for="match-{a['id']}">Matching young fish</label><select id="match-{a['id']}" name="{a['id']}">{options}</select><label class="match-reason-label">What features helped you decide?<textarea name="reason-{a['id']}" rows="2" placeholder="Look at body shape, fins, eyes, and markings."></textarea></label></div></article>''' for a in m["adults"])
    return f'''    <section class="tab-page activity-page" id="activity-match-fish" data-tab-page="activity-match-fish">
      <header class="activity-page-header"><a href="#education-classroom" data-tab-link="education-classroom">&larr; Classroom Activities</a><h1 tabindex="-1">Match the Young Fish to the Adult</h1><p>Choose the young-fish letter for each adult. Look closely at body shape, fins, eyes, and markings—and explain your evidence.</p></header>
      <section class="activity-panel young-fish-panel" aria-labelledby="young-fish-title"><h2 id="young-fish-title">Meet the young fish</h2><div class="juvenile-grid">{juveniles}</div></section>
      <form id="fish-matching-form"><div class="adult-match-grid">{adults}</div><div class="activity-actions matching-actions"><button type="submit">Compare my matches</button><button type="button" data-print-activity>Print worksheet</button><button type="reset" class="activity-button-secondary">Start over</button></div><p id="matching-status" role="status"></p></form>
      <section id="matching-review" class="activity-panel" hidden aria-labelledby="matching-review-title"><h2 id="matching-review-title" tabindex="-1">Your matches, side by side</h2><p>Discuss which features support each match and which features change as fish grow.</p><div id="matching-comparisons"></div></section>
      <dialog id="activity-image-dialog" class="activity-image-dialog" aria-labelledby="activity-image-title"><button type="button" id="activity-image-close" aria-label="Close enlarged image">Close &times;</button><h2 id="activity-image-title"></h2><img id="activity-image-large" alt="" /></dialog>
    </section>
'''


def supplementary_page() -> str:
    resources = json.loads((ROOT / "gui/teaching-materials/manifest.json").read_text(encoding="utf-8-sig"))
    cards = []
    for resource in resources:
        size = resource["pptx"]["bytes"] / 1048576
        cards.append(f'''        <article class="supplementary-resource">
          <img src="{e(resource['thumbnail'])}" alt="Cover of {e(resource['title'])}" width="1000" height="563" loading="lazy" />
          <div class="supplementary-resource-body"><h2>{e(resource['title'])}</h2><p>{e(resource['description'])}</p><p class="supplementary-file-details">{resource['slides']} slides &middot; PowerPoint {size:.1f} MB</p>
            <div class="activity-actions"><button type="button" data-pdf-preview="{e(resource['pdf']['path'])}" data-pdf-title="{e(resource['title'])}" aria-pressed="false">View PDF</button><a href="{e(resource['pptx']['path'])}" download>Download PowerPoint</a><a href="{e(resource['pdf']['path'])}" download>Download PDF</a></div>
          </div>
        </article>''')
    return f'''    <section class="tab-page education-supplementary-page" id="education-supplementary" data-tab-page="education-supplementary">
      <div class="page-header"><p class="eyebrow">Educational Materials</p><h1 tabindex="-1">Supplementary Materials</h1></div>
      <div class="supplementary-resource-grid">
{chr(10).join(cards)}
      </div>
      <section class="supplementary-preview" aria-labelledby="supplementary-preview-title">
        <div class="supplementary-preview-header"><h2 id="supplementary-preview-title" tabindex="-1">PDF preview</h2><a id="supplementary-open-pdf" href="{e(resources[0]['pdf']['path'])}" target="_blank" rel="noopener">Open PDF in a new tab &nearr;</a></div>
        <p id="supplementary-pdf-status" role="status" hidden>Loading PDF…</p>
        <iframe id="supplementary-pdf-frame" class="supplementary-pdf-frame" title="Teaching slides PDF preview"></iframe>
        <p class="supplementary-pdf-help">If your browser does not display the preview, open the PDF in a new tab or download it above.</p>
      </section>
      <a class="activity-resource-link" href="#activity-survey-design" data-tab-link="activity-survey-design">Try the interactive Survey Design Challenge &rarr;</a>
    </section>
'''


def build(data: dict) -> None:
    text = INDEX.read_text(encoding="utf-8")
    start = text.index('    <section class="tab-page" id="education-classroom"') if '    <section class="tab-page" id="education-classroom"' in text else text.index('    <section class="tab-page education-activities-directory"')
    end = text.index('    <section class="tab-page" id="education-outreach"', start)
    text = text[:start] + classroom() + survey_page(data) + matching_page(data) + supplementary_page() + "\n" + text[end:]
    # Replace the placeholder submenu, while retaining the Classroom entrance.
    menu_start = text.index('<div class="nav-nested-submenu" aria-label="Classroom Materials subsections">') if 'aria-label="Classroom Materials subsections"' in text else -1
    if menu_start >= 0:
        inner = text.index(">", menu_start) + 1
        end = text.index("</div>", inner)
        text = text[:inner] + '''
                <a href="#activity-survey-design" data-tab-link="activity-survey-design">Survey Design Challenge</a>
                <a href="#activity-match-fish" data-tab-link="activity-match-fish">Match Young Fish to Adults</a>
                <a href="#education-supplementary" data-tab-link="education-supplementary">Supplementary Materials</a>
              ''' + text[end:]
    text = text.replace("Short species spotlights for the 13 key Hudson River fishes, written for classroom and outreach storytelling.", "Meet Hudson River fishes through species profiles, photographs, and stories about their lives in the estuary.")
    text = text.replace('data-tab-link="education-classroom">Classroom Materials</a>', 'data-tab-link="education-classroom">Classroom Activities</a>')
    text = text.replace('<h2>Classroom Materials</h2>', '<h2>Classroom Activities</h2>')
    text = text.replace("Future worksheet packets, slides, vocabulary lists, and printable activity sheets for teachers and outreach partners.", 'Design a fisheries survey or match young fish to adults. <a href="#education-classroom" data-tab-link="education-classroom">Open classroom activities &rarr;</a>')
    css = '  <link rel="stylesheet" href="education-activities.css?v=1.2.7" />'
    if 'href="education-activities.css?' not in text:
        text = text.replace("</head>", css + "\n</head>")
    js = '  <script src="education-activities.js?v=1.2.7"></script>'
    if 'src="education-activities.js?' not in text:
        text = text.replace("</body>", js + "\n</body>")
    INDEX.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--survey-deck", type=Path)
    parser.add_argument("--matching-document", type=Path)
    args = parser.parse_args()
    if bool(args.survey_deck) != bool(args.matching_document):
        parser.error("Provide both source documents for an import, or neither for a rebuild.")
    data = import_sources(args.survey_deck, args.matching_document) if args.survey_deck else json.loads(DATA.read_text(encoding="utf-8"))
    build(data)
    print("Built two classroom activities from the supplied source content.")


if __name__ == "__main__":
    main()
