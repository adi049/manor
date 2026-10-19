# HOTEL ND MANOR static website

A responsive website for HOTEL ND MANOR in Mothrowala, Dehradun, built with static HTML, CSS and dependency-free JavaScript. It preserves the existing GitHub Pages project-site setup and Phase 3 enquiry interactions. No framework, package installation or build step is required.

## Pages

Core pages:

- `index.html` - homepage, room and restaurant overview, and indoor banquet enquiries
- `about.html` - hotel overview, room categories, event information, location and contacts
- `services.html` - room catalogue, dining information and event enquiry form
- `gallery.html` - centrally configured property photographs, filters and touch-capable lightbox
- `booking.html` - conditional room, event and general enquiry form, contact choices, directions and FAQs

Policies:

- `privacy-policy.html` - static-site form and third-party service privacy information
- `terms-and-conditions.html` - room, rate, event and enquiry terms

`404.html` retains GitHub Pages project-path handling, legal links and a direct call link. Navigation and local assets use relative paths where required for project-site compatibility.

## Shared configuration

Use `assets/js/site-config.js` as the central source for public hotel details, room categories, occupancy rules, gallery records and video availability.

Configured official details:

- HOTEL ND MANOR, Doon University Road, Mothrowala, Dehradun, Uttarakhand 248121
- Email: `ndmanorhotel@gmail.com`
- Calls: `+91 99684 07707`, `+91 70789 44451`
- WhatsApp: `+91 74177 74451` (`https://wa.me/917417774451`) and `+91 70789 44451` (`https://wa.me/917078944451`)
- Instagram: `https://www.instagram.com/hotelndmanordehradun/?hl=en`
- The supplied Google Maps destination and directions are kept in `hotel.maps` and `hotel.directions`.


## Rooms and occupancy

The public room catalogue uses exactly three names: Deluxe Room; Super Deluxe Room With Balcony; and Royal Suite With Bathtub.

- Maximum occupancy is three guests per room, counting adults and children together. The booking form enforces the combined limit.
- Any approved room-rate quote applies to two guests. Additional-person charges apply; the hotel must confirm the amount directly.
- The current-rate wording is **Contact the hotel for current rates.** No unapproved amounts or meal inclusions are published.

## Enquiry behaviour

The booking form shows room fields only for a room enquiry, event date and approximate guest count only for an event enquiry, and no conditional section for a general enquiry. URL query parameters can preselect an enquiry type or room category. The Services page includes a separate event enquiry form.

Submit buttons remain disabled until their draft handlers are attached; without JavaScript, the forms do not submit entered details. A valid submission opens a chooser for the configured WhatsApp numbers and prepares a message draft. Visitors review the draft and press Send themselves. There is no website form backend, payment collection, automatic message sending or confirmed-booking claim. HOTEL ND MANOR confirms availability, current rates, arrangements and booking terms manually. Event capacity, package details, menu inclusions and venue arrangements must be confirmed directly.

`assets/js/site-validation.js` contains the shared occupancy validator and is loaded before `site.js` on the five core pages and both policy pages.

## Images and gallery

Image paths are mapped in `site-config.js` under `images`; the `galleryItems` array centrally stores each gallery caption, alt description, category and optional layout. Neutral captions are used when the exact room identity has not been confirmed. The two room photographs remain in the gallery but are not assigned to specific room categories. The bathtub photo is likewise not assigned to Royal Suite With Bathtub. The lounge photo is labelled as lounge seating, not as a banquet setup.

The gallery currently shows eight distinct existing property photographs. One available upload, `/uploads/download.png`, was visually compared with `restaurant-dining.webp` and found to be a near-duplicate, so it is not added a second time. Add a new photograph only after the actual file is supplied and reviewed.

Use only approved property photography, write accurate alt text, and keep image paths relative. `layout: "tall"` and `layout: "wide"` create variation without copying images.

## Video slots

All six slots in `videoSlots` are currently marked unavailable: `intro`, `homeHero`, `deluxeRoom`, `superDeluxeRoom`, `hotelWalkthrough` and `banquetHighlights`. The configured room-video associations are not verified for category-specific promotion. Do not set a slot to `available: true` until an approved clip exists and its subject, category and intended use are confirmed. Still-photo fallbacks remain in place; there is no fabricated footage.

See `assets/img/README.md` and `assets/videos/README.md` for asset handling notes.

## Shared navigation, contact actions and motion

The standard pages use one desktop header and a separate mobile menu that stays hidden and inert while closed. A fixed Call, direct WhatsApp and Instagram group is available on the standard pages; it moves to a compact, safe-area-aware row on narrower screens and yields when it would overlap forms or footer links. Regular footer contact links remain in place.

Text and still-photo entrances are one-time, scroll-triggered enhancements. Content is not hidden while waiting for JavaScript or an observer, and the motion respects the operating system's reduced-motion preference. The inactive intro-video gate is not used, so the page remains readable if a shared script fails.

## Local checks

Run from the repository root:

```sh
node --check assets/js/site.js
node --check assets/js/site-validation.js
node tests/test_site_logic.js
python3 scripts/check_site.py
python3 -m http.server 8000
```

The static checker covers required pages, local references, titles, legal links, standard and floating contact links, the three-room catalogue, shared navigation, enquiry forms, occupancy safeguards, reduced-motion CSS and touch-lightbox hooks. A static server is useful for manual browser and responsive testing.

## GitHub Pages

The supplied site base is `https://adi049.github.io/LiveNDMARON/`. The existing Pages workflow and project-site paths are retained. No custom domain was added. No push or deployment was performed as part of this work; verify the repository's current Actions/Pages status separately after an authorised push.


Mobile layout repair: this build includes additional responsive rules for phones and small screens. Upload the contents of this ZIP to the repository root, keeping the assets folder structure intact.
