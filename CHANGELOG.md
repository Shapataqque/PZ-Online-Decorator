# Changelog

## 1.1.0

- The tutorial now waits for the user to click **Load PZ Location** on step 2, advances automatically when the loader opens, and closes the loader automatically on tutorial steps that do not use it.
- View Filters now apply only to the currently selected Z level, so lower visible floors keep their original categories visible.
- Corrected filter classification for specific indoor vegetation, school, and counter sprites.
- Picker now presents a choice list when several objects share the same cell.
- Added semi-transparent placement previews for tiles and multi-tile furniture before placement.
- Added surface-aware vertical placement for tabletop items such as TVs, radios, lamps, and similar sprites.
- Added an optional **Choose from map** coordinate picker with a locally generated, zoomable and pannable overview of the selected map dataset.

## 1.0.0

This is the first public release I consider ready for normal use.

- I improved the first-run tutorial so the screen is only lightly dimmed and the highlighted area stays fully visible.
- The tutorial now opens and shows the complete **Load PZ Location** window while explaining the import flow.
- I added a persistent **Night** mode switch next to Feedback, with a matching light interface.
- I kept the 16×16 chunk renderer, viewport culling, GPU buffer caching, safe draw batching, lazy textures, View Filters, furniture catalogue, JSON projects, graphics settings, and collapsible panels from the performance-focused builds.
- I cleaned the public repository layout and removed internal deployment/review notes that are not needed by users or contributors.
- I consolidated attribution and licensing information for the public open-source release.
