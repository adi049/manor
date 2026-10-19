#!/usr/bin/env python3
"""Dependency-free static acceptance checks for the HOTEL ND MANOR site."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CORE = ["index.html", "about.html", "services.html", "gallery.html", "booking.html"]
LEGAL = ["privacy-policy.html", "terms-and-conditions.html"]
PAGES = CORE + LEGAL + ["404.html"]
errors: list[str] = []


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.local_refs: list[tuple[str, str]] = []
        self.footer_depth = 0
        self.footer_legal: set[str] = set()
        self.titles: list[str] = []
        self.in_title = False
        self.h1_depth = 0
        self.h1_text: list[str] = []
        self.data_page: str | None = None
        self.forms = 0
        self.inputs: dict[str, dict[str, str]] = {}
        self.labels: list[str] = []
        self.current_label_for: str | None = None
        self.site_name_meta = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key: (value or "") for key, value in attrs}
        if attrs_dict.get("id"):
            self.ids.append(attrs_dict["id"])
        for attr in ("href", "src", "poster", "data-src"):
            value = attrs_dict.get(attr, "")
            if value and not value.startswith(("#", "https://", "http://", "mailto:", "tel:", "data:", "javascript:")):
                self.local_refs.append((attr, value))
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_depth += 1
        if tag == "body":
            self.data_page = attrs_dict.get("data-page")
        if "site-footer" in attrs_dict.get("class", "").split():
            self.footer_depth += 1
        if self.footer_depth and tag == "a" and attrs_dict.get("href") in LEGAL:
            self.footer_legal.add(attrs_dict["href"])
        if tag == "form":
            self.forms += 1
        if tag in ("input", "select", "textarea") and attrs_dict.get("id"):
            self.inputs[attrs_dict["id"]] = attrs_dict
        if tag == "label" and attrs_dict.get("for"):
            self.current_label_for = attrs_dict["for"]
        if tag == "meta" and attrs_dict.get("property") == "og:site_name" and attrs_dict.get("content") == "HOTEL ND MANOR":
            self.site_name_meta = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "h1" and self.h1_depth:
            self.h1_depth -= 1
        if tag == "label":
            self.current_label_for = None
        if tag == "footer" and self.footer_depth:
            self.footer_depth -= 1

    def handle_data(self, data: str) -> None:
        text = data.strip()
        if self.in_title and text:
            self.titles.append(text)
        if self.h1_depth:
            self.h1_text.append(data)
        if self.current_label_for:
            self.labels.append(self.current_label_for)


def fail(message: str) -> None:
    errors.append(message)


all_public_text: dict[str, str] = {}
for page in PAGES:
    path = ROOT / page
    if not path.exists():
        fail(f"Missing required page: {page}")
        continue
    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)
    parser.close()
    all_public_text[page] = re.sub(r"\s+", " ", text)
    if len(parser.ids) != len(set(parser.ids)):
        duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        fail(f"{page}: duplicate IDs: {duplicates}")
    for attr, ref in parser.local_refs:
        clean = ref.split("?", 1)[0].split("#", 1)[0]
        if not clean:
            continue
        target = (path.parent / clean).resolve()
        if not target.exists():
            fail(f"{page}: missing local {attr} target {ref}")
    if page != "index.html" and "HOTEL ND MANOR" not in " ".join(parser.titles):
        fail(f"{page}: page title must include the exact official brand")
    if page in CORE + LEGAL + ["404.html"]:
        if parser.footer_legal != set(LEGAL):
            fail(f"{page}: footer must link both legal pages, found {sorted(parser.footer_legal)}")
    if page in CORE + LEGAL:
        for contact_attr in ("data-phone-link", "data-whatsapp-link", "data-instagram-link"):
            if contact_attr not in text:
                fail(f"{page}: regular contact/footer link {contact_attr} is missing")
        if text.count('class="site-header"') != 1:
            fail(f"{page}: exactly one standard desktop header is required")
        if text.count('class="mobile-menu"') != 1:
            fail(f"{page}: exactly one separate mobile navigation is required")
        mobile_nav = re.search(r'<nav class="mobile-menu"[^>]*>', text)
        if not mobile_nav or 'aria-hidden="true"' not in mobile_nav.group(0) or "inert" not in mobile_nav.group(0):
            fail(f"{page}: closed mobile navigation must be aria-hidden and inert by default")
        widget_match = re.search(r'<nav class="floating-contact"[\s\S]*?</nav>', text)
        if not widget_match:
            fail(f"{page}: floating Call, WhatsApp and Instagram actions are required")
        else:
            widget = widget_match.group(0)
            if len(re.findall(r'<a\b', widget)) != 3 or len(re.findall(r'<svg\b', widget)) != 3:
                fail(f"{page}: floating contact group must have three links and inline icons")
            for destination in (
                'href="tel:+919968407707"',
                'href="https://wa.me/917417774451"',
                'href="https://www.instagram.com/hotelndmanordehradun/?hl=en"',
            ):
                if destination not in widget:
                    fail(f"{page}: floating contact destination missing: {destination}")
            if 'target="_blank" rel="noopener noreferrer"' not in widget:
                fail(f"{page}: floating Instagram link must open safely in a new tab")
            if "data-whatsapp-link" in widget or re.search(r'[?&]text=', widget):
                fail(f"{page}: floating WhatsApp action must open a direct chat without an injected message")
    if page in CORE + LEGAL:
        if "intro-pending" in text:
            fail(f"{page}: page content must not be gated behind the inactive intro screen")
        if 'src="assets/js/site-validation.js"' not in text or 'src="assets/js/site.js"' not in text:
            fail(f"{page}: shared scripts are missing")
        elif text.index('src="assets/js/site-validation.js"') > text.index('src="assets/js/site.js"'):
            fail(f"{page}: shared validation helper must load before site.js")
    if page == "index.html":
        heading = re.sub(r"\s+", " ", "".join(parser.h1_text)).strip()
        if heading != "Welcome to Hotel ND Manor":
            fail(f"index.html: homepage H1 must be exactly 'Welcome to Hotel ND Manor', found {heading!r}")
        if not parser.site_name_meta:
            fail("index.html: Open Graph site name must be HOTEL ND MANOR")

for page, text in all_public_text.items():
    for forbidden in ("5 guests", "five guests"):
        if forbidden.lower() in text.lower():
            fail(f"{page}: public page contains retired/ambiguous rate or room wording: {forbidden}")
    if "ndmanor.com" in text.lower():
        fail(f"{page}: old custom-domain reference remains")
    if "—" in text:
        fail(f"{page}: em dash remains")

config_text = (ROOT / "assets/js/site-config.js").read_text(encoding="utf-8")
site_js = (ROOT / "assets/js/site.js").read_text(encoding="utf-8")
css = (ROOT / "assets/css/site.css").read_text(encoding="utf-8")
services_source = (ROOT / "services.html").read_text(encoding="utf-8")
room_ids = re.findall(r'data-room-id="([^"]+)"', services_source)
if room_ids != ["deluxe-room", "super-deluxe-balcony", "royal-suite-bathtub"]:
    fail(f"services.html: expected exactly the three approved room cards, found {room_ids}")
if "A Welcoming Base in <em>ND Manor Hotel</em>" not in (ROOT / "about.html").read_text(encoding="utf-8"):
    fail("about.html: About Us subheading must use the approved exact wording")
if not re.search(r'\.mobile-menu\s*\{\s*display:\s*none;', css) or not re.search(r'\.mobile-menu\s*\{\s*display:\s*block;', css):
    fail("site.css: mobile navigation must be hidden by default and restored at the mobile breakpoint")
if "function initScrollReveals" not in site_js or "function initMediaReveals" not in site_js:
    fail("site.js: one-time scroll-triggered text and photo reveals are required")
if "function initFloatingContact" not in site_js or ".floating-contact__link:focus-visible" not in css:
    fail("floating contact controls must include overlap handling and keyboard focus styles")
if "env(safe-area-inset-bottom" not in css or "env(safe-area-inset-right" not in css:
    fail("site.css: floating contact controls must respect mobile safe-area insets")
if "NDMValidateOccupancy" not in site_js:
    fail("site.js: room booking must use the guest-occupancy validator")
validation_source = (ROOT / "assets/js/site-validation.js").read_text(encoding="utf-8")
if '"Adults and children together cannot exceed " + maximum + " guests per room."' not in validation_source:
    fail("site-validation.js: combined adult-and-child occupancy must use the configured three-guest limit")
if "prefers-reduced-motion: reduce" not in css:
    fail("site.css: reduced-motion alternative is required")
if "function initContactActions" not in site_js or ".contact-dialog" not in css:
    fail("normal contact choices must remain available in page content")
if "Contact the hotel for current rates" not in all_public_text.get("services.html", ""):
    fail("services.html: current-rate wording must direct guests to the hotel")
if "touchstart" not in site_js or "touchend" not in site_js:
    fail("site.js: gallery lightbox must support touch swipes")
if 'data-booking-fields="room"' not in (ROOT / "booking.html").read_text(encoding="utf-8") or 'data-booking-fields="event"' not in (ROOT / "booking.html").read_text(encoding="utf-8"):
    fail("booking.html: conditional room and event groups must remain present")
for token in ("applyQueryPreselection", "URLSearchParams", "This is an enquiry only, not a confirmed reservation or event booking.", "I will review this draft and press Send in WhatsApp."):
    if token not in site_js:
        fail(f"site.js: Phase 3 enquiry behaviour or copy is missing: {token}")
if "https://adi049.github.io/LiveNDMARON/" not in config_text:
    fail("site-config.js: supplied GitHub Pages base URL missing")
if "ndmanor.com" in config_text.lower():
    fail("site-config.js: custom-domain reference remains")

print(f"Static checks: inspected {len(all_public_text)} required HTML pages and local references.")
if errors:
    for error in errors:
        print("FAIL:", error)
    sys.exit(1)
print("Static checks passed: page paths, local assets, metadata, legal footer links, normal contact links, occupancy, enquiry safeguards, three-room catalogue, shared navigation, floating actions, reveal motion, reduced-motion and touch-lightbox hooks.")
