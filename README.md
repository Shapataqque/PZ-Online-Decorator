# PZ Online Decoration Tool 1.9.0

Release build of the browser-based Project Zomboid decoration planner.

The application is static: it does not require a database or application server, and it does not upload the user's Project Zomboid media folder. Game files are selected and parsed locally in the browser.

## First use

1. Open the site. The first-run tutorial explains the normal workflow and can be skipped permanently.
2. Choose **Load PZ Location**.
3. Select the local `ProjectZomboid/media` folder.
4. Enter **World X** and **World Y**, then load a building or area.
5. Use Tiles / Furniture, View Filters, Z levels, and the editing tools to plan the base.
6. Use **Save as .json** to preserve the plan. Reload it later with **Open .json file**.

The tutorial can be replayed from **Settings → Start tutorial**.

## Main features

- Project Zomboid `.lotheader` / `.lotpack` location import.
- Local `.pack`, PNG, and `.tiles` indexing with media-folder reuse.
- Property-based View Filters without rewriting imported storage stacks.
- Multi-Z perspective view.
- Furniture catalogue with categories, thumbnails, rotation, and multi-tile placement.
- Pencil, erase, rectangle, picker, pan, undo, and redo.
- Per-layer visibility, opacity, and lock state.
- JSON project save/open.
- Low / Medium / High graphics quality.
- 16×16 spatial chunk culling, chunk GPU-buffer caching, painter-order-safe batching, and lazy GPU texture upload.
- Optional performance statistics.
- First-run onboarding tutorial.
- Feedback UI and optional support link.

## Privacy

By default this release makes no network request for Project Zomboid files, projects, coordinates, or user content. A feedback endpoint is only used if the site owner explicitly configures one in `config/release-config.js`.

The feedback form never automatically includes local file paths, world coordinates, or project contents.

## Site-owner configuration

Edit `config/release-config.js` to configure:

- `feedbackEndpoint`: optional same-origin POST endpoint such as `/api/feedback`.
- `feedbackUrl`: optional HTTPS feedback page such as a GitHub Issues form.
- `supportUrl`: optional HTTPS support page such as Buy Me a Coffee.

Never put API keys, passwords, private tokens, or other secrets in that file. It is public browser code.

See `OWNER_SETUP.md`, `SECURITY.md`, and `deploy/` before publishing the site.

## Build

The compiled application is already included in `dist/app.js`.

To rebuild from TypeScript:

```sh
tsc -p tsconfig.json
```

## Licensing and upstream notices

See `LICENSE`, `SOURCE_NOTICES.md`, and `licenses/`. No Project Zomboid game assets are included in this release.
