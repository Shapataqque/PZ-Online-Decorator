# Changelog

## 1.9.0 Release

- Added a blocking first-run tutorial with Continue / Back / Skip, a remembered “don't show again” preference, and a replay control under Settings.
- Added a Feedback dialog with safe local copy, optional same-origin feedback POST support, and optional HTTPS feedback-page fallback.
- Added an optional Support button driven by public release configuration; no third-party widget or script is embedded.
- Added a restrictive browser Content Security Policy and no-referrer policy.
- Removed inline event-handler JavaScript from HTML.
- Removed the public synthetic benchmark hook and development-only performance-test artifact.
- Removed dynamic HTML injection from the furniture catalogue and other release UI paths.
- Added JSON project size/schema limits before project reconstruction.
- Added a media-folder file-count safety limit.
- Added release deployment and security documentation, including hardened Nginx and Caddy examples.
- Added top-level GPL license copy and public configuration guidance.

## 1.9

- Added 16×16 spatial chunks per Z level with viewport culling and a one-chunk safety margin.
- Added chunk render caches and GPU vertex-buffer reuse.
- Editing invalidates only the touched chunk / Z level where possible.
- View Filters remain render-only and do not rewrite Imported Base storage.
- Added painter-order-safe batching of consecutive compatible texture commands.
- Added lazy GPU texture upload and cache reuse across location loads.
- Added optional Performance Stats: FPS, frame time, visible / total chunks, visible sprites, draw calls, GPU texture pages, cached batches, and dirty chunks.
- JSON map format version advanced to 3; older project JSON data remains readable through the loader.

## 1.8

- Added property-based View Filters over ordered imported object stacks.
- Consolidated media/map/texture loading into the PZ Location workflow.
- Added JSON save/open, unlocked Imported Base, per-layer locks, furniture catalogue, graphics settings, and collapsible panels.
