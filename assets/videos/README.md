# HOTEL ND MANOR video slots

All six slots are configured in `assets/js/site-config.js` under `videoSlots`. The slots preserve the repository's expected relative paths, but all are currently inactive (`available: false`). Mark a slot available only after its approved video file exists and its subject, category and intended page placement have been confirmed.

| Slot | Configured file | Current state | Review before enabling |
| --- | --- | --- | --- |
| `intro` | `intro-video.mp4` | Not supplied; inactive | Approved hotel introduction and current poster. |
| `homeHero` | `home-hero.mp4` | Not supplied; inactive | Approved, relevant hero footage; the exterior photograph remains the fallback. |
| `deluxeRoom` | `deluxe-room.mp4` | Inactive | Existing file is not used until room-category association and current content are confirmed. |
| `superDeluxeRoom` | `super-deluxe-room.mp4` | Inactive | Existing file is not used until room-category association and current content are confirmed. |
| `hotelWalkthrough` | `hotel-walkthrough.mp4` | Not supplied; inactive | Approved walkthrough footage. |
| `banquetHighlights` | `banquet-highlights.mp4` | Not supplied; inactive | Actual banquet/event footage. The lounge-seating photograph is not evidence of a banquet setup. |

The opening film, homepage hero, hotel walkthrough and banquet-highlight video are not available in the supplied materials. The existing room clips are also inactive pending confirmation of their category identity. Still-photo fallbacks remain available. No unrelated or fabricated footage is used.

For new footage, use a web-optimised H.264 MP4 at a suitable resolution and bitrate, with an approved poster image. Test locally and on mobile, including autoplay-restricted and reduced-motion settings. Videos should remain muted where they auto-play, load only when needed, and provide a usable still-image fallback.
