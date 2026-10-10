# Changelog

## 1.1.7 — 10 October 2026

- Replaced destination-dependent Ground / Surface / OnTable behavior with explicit numeric placement heights.
- The Inspector now shows **Floor (H0)**, common media-derived height presets, and a Custom numeric height.
- Common presets are calculated from repeated `Surface` / `ItemHeight` values found in table-, counter-, desk-, cabinet-, and shelf-like tile definitions in the selected media folder.
- Imported Base is permanently read-only. Pencil and Rectangle operations started while Imported Base is selected automatically create/use an editable category layer instead of modifying imported game stacks.
- Picker selections from Imported Base no longer make future placements part of the imported stack.
- Preview and committed objects now call the same vertical-offset function: `selected height - authored sprite offset`.
- Project JSON format v4 stores per-cell numeric `placementHeights`. Older Ground / Surface / OnTable metadata is migrated to approximate numeric heights when opened.

## 1.1.6 — 10 October 2026

- Moved **Choose Media Folder** to the main toolbar next to **New**.
- Added a first-run prompt asking the user to select the Project Zomboid media folder.
- Selecting the media folder now automatically indexes `.pack`, PNG, and `.tiles` resources in the background without loading a world location.
- Renamed **Load PZ Location** to **Load World Location** and reduced that dialog to map dataset, coordinates, and load-mode controls.
- Changed the default world-load mode to **Area around coordinate**.
- Removed the Inspector's raw `Properties:` line.
- Fixed another tabletop-placement case: some vanilla movable sprites have their vertical placement baked into the packed 128×256 sprite frame even when their `.tiles` entry does not expose `IsSurfaceOffset`. For Furniture / Decor sprites, the renderer now infers that authored vertical offset from the packed frame and compensates it when using Ground / Surface / OnTable.
- Ground now moves these raised-art sprites back to floor height; Surface and OnTable target the destination support height rather than adding that height on top of the baked art position.

## 1.1.5 — 10 October 2026

- Fixed vertical placement for sprites that use `IsSurfaceOffset`.
- Placement now treats a sprite's own `Surface` offset separately from the destination height.
- **Ground** targets height 0, so tabletop-authored sprites can be moved down to the floor correctly.
- **Surface** targets the current destination object's world `ItemHeight`.
- **OnTable** targets the destination table/counter surface height.
- Final render offset is calculated as **destination target height - source surface offset**, preventing table-height values from being added twice.
- Imported base objects retain their original game alignment; only user-placed objects are compensated according to Ground / Surface / OnTable.
- Placement previews use the same corrected calculation as committed objects.

## 1.1.4 — 10 October 2026

- Removed **Choose with PZmap.org** and the coordinate-map workflow completely. World X / Y are now entered directly.
- Restored **Ground**, **Surface**, and **OnTable** placement controls.
- **Ground** places at floor height.
- **Surface** uses the highest `ItemHeight` value of an existing object in the destination cell.
- **OnTable** uses the destination table/counter surface height; it prefers tile metadata and falls back to table/counter naming rules when needed.
- Picker and Furniture selections reset to **Ground**, so selecting an already elevated object does not carry that elevation into future placements.
- Removed the unused local top-view overview renderer from the codebase.

## 1.1.3 — 10 October 2026

- Removed the tutorial and all tutorial UI/logic.
- Replaced the slow local coordinate-map renderer with a fast PZmap.org reference workflow. PZmap.org opens in a separate tab and copied coordinates can be pasted back into the loader.
- Removed the Ground / Surface / OnTable placement controls.
- Tabletop placement now uses destination context: compatible small objects snap upward only when the destination cell actually contains a supporting surface; otherwise they stay on the floor.
- Picker no longer carries the source object's previous table height into future placements.
- Existing v1.1.2 Surface / OnTable project metadata is migrated to the new automatic placement behavior when projects are opened.

## 1.1.2 — 10 October 2026

- Replaced the coarse coordinate overview with a locally rendered top-view map using per-square map data, following the same general top-view approach used by PZmap/pzmap2dzi.
- View Filters now prioritize tiles whose names contain `appliances` or `furniture` as Furniture even when conflicting tile properties suggest another category.
- Aligned the Z-level dropdown and up/down controls.
- Picker now matches imported multi-tile furniture by canonical tileset name and tile index, not only exact sprite spelling.
- Replaced automatic tabletop guessing with explicit **Ground**, **Surface**, and **OnTable** placement modes.
- Hardened tutorial step 2 so clicking **Load PZ Location** opens the loader before the tutorial advances.

## 1.1.1 — 10 October 2026

- Reworked the coordinate picker into a colored semantic map showing vegetation, roads/ground, water, urban areas, and building footprints.
- Replaced the first tabletop placement approach with a heuristic fallback for TVs, radios, computers, lamps, and similar small objects when placed on tables/counters.
- Added Z-level up/down buttons next to the existing dropdown.
- Refined View Filters: roads/ground, vegetation, and fences/railings are now separate categories; Exterior is reserved for outdoor/exterior clutter-style objects.
- Rectangle now shows a semi-transparent placement preview while dragging.
- Fixed repeated erase calls on the same cell during a single stroke and added a local exportable edit log for debugging.
- Picker now offers complete multi-tile furniture objects when a clicked tile belongs to one.
- Fixed tutorial interaction around Load PZ Location and simplified tutorial wording.

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
