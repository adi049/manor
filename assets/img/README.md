# HOTEL ND MANOR image assets

Existing HOTEL ND MANOR photography and the official logo are retained in this folder and `gallery/`. Image paths live in `assets/js/site-config.js` under `images`; gallery captions, alt text, category and layout are centralized in `galleryItems`.

## Identity and captions

- The two existing bedroom photographs are distinct images, but their exact room-category identities have not been verified. They appear in the gallery with neutral captions and are not assigned to a specific room card.
- The bathtub photograph shows a tub and a bedroom through glass; this alone does not establish its room category. It remains a neutral gallery image and is not used as the Royal Suite With Bathtub room-card photo until the association is confirmed.
- `banquet-lounge.webp` shows lounge seating, not a banquet setup. Use neutral lounge wording and do not present it as a photograph of the banquet hall setup.
- `nd-manor-1000.webp` and `nd-manor-1600.webp` are different sizes of the same dusk exterior, so they are not separate gallery entries. `hotel-exterior-night.webp` is a distinct night exterior photograph.
- The only upload found in `/uploads` was `download.png`. It is a near-duplicate of `restaurant-dining.webp`, so it is not added redundantly.

The current gallery contains eight distinct existing property photographs. Each configured gallery tile maps to one of those supplied image files; captions and categories remain tied to the verified subject of each photograph.

Add a new gallery entry only after the actual approved file is supplied and reviewed. Use a unique ID, descriptive alt text, a neutral caption where identity is uncertain, a verified category (`rooms`, `interiors`, `lounge`, `dining`, `events` or `exterior`), and optional `layout: "tall"` or `layout: "wide"`.

Use approved HOTEL ND MANOR photography only. No generic stock imagery is included. The logo and favicon use the existing official mark. Poster images for video slots are configured under `videoSlots`; clips remain inactive until their source, subject and room/event association are confirmed.
