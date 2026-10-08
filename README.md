# PZ Online Decoration Tool

I built PZ Online Decoration Tool as a browser-based way to load an existing Project Zomboid location and experiment with furniture, decorations, layers, Z levels, and view filters without opening the game editor for every small change.

The tool reads the Project Zomboid `media` folder locally in the browser. I do not bundle Project Zomboid game assets in this repository, and the selected game files are not uploaded by the application.

## What it can do

- Load an existing Project Zomboid building, area, or map cell from `.lotheader` / `.lotpack` data.
- Index local `.pack`, PNG, and `.tiles` data from the selected `media` folder.
- Preserve imported squares as ordered sprite/object stacks.
- Use `.tiles` properties and object definitions for display-only View Filters such as walls, floors, doors/windows, furniture, roofs, overlays, exterior objects, and other sprites.
- Browse searchable furniture categories with thumbnails and multi-tile placement.
- Work with multiple Z levels in an isometric perspective view.
- Edit with Pencil, Erase, Rectangle, Picker, and Pan tools.
- Use per-layer visibility, opacity, and lock controls.
- Save projects as JSON and open them later.
- Switch between Low, Medium, and High graphics quality.
- Use 16×16 spatial chunks, viewport culling, cached GPU buffers, painter-order-safe batching, and lazy texture upload for larger maps.
- Show optional performance statistics.
- Use either night mode or the light interface.

## Quick start

1. Open the site and follow the first-run tutorial.
2. Click **Load PZ Location**.
3. Select the local `ProjectZomboid/media` folder.
4. Enter the World X and World Y coordinates of the location you want.
5. Load the building or area.
6. Browse **Tiles** or **Furniture**, use **View Filters** when walls or roofs are in the way, and decorate the map.
7. Use **Save as .json** to keep the project.

The tutorial can be started again from **Settings → Start tutorial**.

## Running locally

This is a static web application. The compiled JavaScript is already included in `dist/app.js`.

Opening `index.html` directly works in browsers that allow the required local file APIs. Hosting the repository as a normal static site is the recommended setup.

To rebuild the TypeScript source:

```sh
tsc -p tsconfig.json
```

## Privacy

Project Zomboid files are selected and parsed locally in the browser. The application does not automatically send map files, project files, world coordinates, local paths, or imported content anywhere.

Feedback only uses a configured destination. Technical information is included only when the checkbox in the feedback form is enabled.

## Open source and forks

I am releasing this project under the **GNU General Public License v2.0 or later (GPL-2.0-or-later)**. The project is based in part on GPL-covered Project Zomboid mapping-tool work, so keeping the project under a compatible open-source license is important.

You are welcome to use, study, modify, redistribute, and fork the project under the terms of the license. If you publish a fork or redistribute the project, I ask that you keep the **PZ Online Decoration Tool** attribution and the upstream credits in `CREDITS.md` intact, and clearly state when your version has been modified. The GPL license and upstream notices remain the controlling legal terms.

No Project Zomboid game assets are included in this repository.

## Credits

This project would not exist without the Project Zomboid mapping/modding community and the mapping tools that came before it. I have kept the detailed acknowledgements in [CREDITS.md](CREDITS.md).

PZ Online Decoration Tool is an unofficial community project and is not affiliated with or endorsed by The Indie Stone.

## License

The project is distributed under **GPL-2.0-or-later**. See `LICENSE`, `NOTICE`, `CREDITS.md`, and the license texts under `licenses/`.
