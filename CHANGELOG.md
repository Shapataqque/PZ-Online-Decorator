# Changelog

## 1.1.14 — 10 October 2026

- Improved initial media-folder indexing: `.tiles` parsing and `.pack` indexing now begin concurrently.
- Texture packs are indexed before raw PNG fallback sheets. When a pack already covers the complete `.tiles` count for a tileset at the same or higher scale, the duplicate PNG sheet is not decoded.
- Increased PNG fallback decode concurrency from 6 to 8 and reduced progress-DOM update frequency.
- Removed the Picker sentence `Catalog-matched sprites are selected as rotatable furniture objects.`
- Explicitly classify every `fixtures_counters_*` sprite as **Furniture**, before Wall / Doors & Windows metadata checks.

## 1.1.13 — 10 October 2026

- Replaced the broad `e_*` legacy-tree pool with the 11 vanilla Build 42 tree families used by `NatureTrees`.
- `vegetation_trees_01_*` placeholders now resolve to normal stage 2/3 sprites, matching the game's existing-tree replacement path; jumbo, snow/seasonal and unrelated erosion assets are no longer eligible.
- Restored Wall classification priority ahead of generic furniture-catalog membership so wall tiles are controlled by the Wall filter again.
- Returned elevated Z-level grids to the normal neutral grid color while retaining the dashed adjacent-level reference plane and vertical hover connector.

## 1.1.12 — 10 October 2026

- Fixed the remaining legacy-tree rendering path: `vegetation_trees_01_*` no longer falls back to a raw placeholder texture when one exists in the indexed media. Imported trees, placement ghosts, user layers, Picker previews, Selection previews, and Tiles previews all use the same coordinate-aware erosion-tree resolver.
- Pressing **Esc** clears the active tile/furniture selection and removes the Pencil preview.
- Replaced sequential top-first Erase behavior with a checkbox object chooser. Clicking with Erase lists every visible object on that cell and applies the selected deletions together with normal undo/redo history.
- Added explicit Z-plane visualization: non-zero active grids are highlighted, the adjacent level is shown as a faint dashed reference plane, and the hovered cell displays a vertical connector between the two planes.

## 1.1.11 — 10 October 2026

- Removed the arbitrary global jumbo-tree alias fallback from 1.1.10.
- `vegetation_trees_01_*` lot placeholders are now resolved per world coordinate using the loaded erosion-tree (`e_*`) families.
- The resolver selects normal/green seasonal frames instead of snow frames and uses a weighted mix of growth sizes; XXL trees are rare rather than being repeated for every placeholder.
- Tree selection is deterministic for a given world coordinate, so reloading the same imported location produces the same preview.
- If the required erosion tree textures are unavailable, the placeholder is left unresolved instead of displaying a confidently wrong jumbo/snow sprite.

## 1.1.10 — 10 October 2026

- Added a Build 42 jumbo-tree fallback for missing `vegetation_trees_01_*` map placeholders. The game stores the rendered jumbo tree art in separate tree texture packs under different sprite names, so unresolved legacy tree tiles now receive stable preview aliases.
- Tiles with `roof` / `roofs` in the sprite name are classified as **Roof** before overlay metadata can move them into Decor / Overlay.
- Furniture-catalog membership now matches canonical tileset + numeric index, so padded catalog names such as `_007` match imported map names such as `_7`. This fixes **Vegetation - Indoor #7** and the same class of imported-base mismatch.
- **Furniture** is now the default first tab; **Tiles** is second.
- `.tiles` metadata is searchable for both Furniture and Tiles, including keys and values such as `CustomName`, `GroupName`, materials, container types and other properties.
- Furniture cards prefer metadata-derived names such as `GroupName + CustomName`, while retaining the source catalog category/index as secondary text.
- Added a small synonym layer for common terms such as oil/fuel/gas/petrol, sofa/couch, fridge/refrigerator, TV/television and trash/bin/garbage.

## 1.1.9 — 10 October 2026

- Removed the Inspector's **Map / Center** controls and all user-facing **Layers** controls.
- Internal layers remain only as a compatibility/stacking implementation detail and are normalized to visible, unlocked, full-opacity behavior when projects are loaded.
- Pencil and Rectangle no longer depend on an active user-selected layer. Repeated Pencil events on the same cell during one drag are ignored, preventing duplicate Floor/Furniture backing layers.
- Eraser now searches all internal layers at the current Z level before Imported Base, so editing behaves as one unified scene.
- Furniture entry variants are shown as **Alternative appearance 1, 2, 3…** instead of exposing W/N/E/S direction codes. **R Rotate object** still cycles through the available appearances.
- `fixtures_railings_*` tiles are prioritized as **Fences & Railings** even when they also exist in the furniture catalog.
- `animated_clock_01_1` is explicitly classified as **Furniture**, including for imported-base view filtering.
- Settings wording now uses **Display** and **Credits** instead of Help.
- Selected buttons use white text in light mode for better contrast.

## 1.1.8 — 10 October 2026

- Restored editable **Imported Base** behavior. Imported map objects can be erased again when the base is unlocked, with undo/redo support.
- New user placements still go to editable user layers so their numeric placement height remains available.
- Picker now resolves catalog-matched sprites, including single-tile objects, as full furniture selections so **R** rotation works after picking.
- **Pencil** now places the currently selected furniture object as well as selected individual tiles.
- Placement-height presets are displayed only as H-codes. Added Inspector +/- controls and keyboard **+ / -** shortcuts for one-unit adjustments.
- Simplified furniture text in the Inspector to remove repeated **Furniture** and layer labels.
- The placement examples reported in testing show that the correct H value depends on both the supporting furniture and the selected sprite's authored vertical offset; this release keeps H selection explicit instead of forcing a destination-only automatic rule.

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
