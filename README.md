# PZ Online Decoration Tool

I built PZ Online Decoration Tool as a browser-based way to load an existing Project Zomboid location; experiment and decorate with furniture, tiles, roads, decorations etc. without opening the game.

The tool reads the Project Zomboid `media` folder locally in the browser. I do not bundle Project Zomboid game assets in this repository, and the selected game files are not uploaded by the application.

## What it can do

- Load an existing Project Zomboid building, area, or map cell from `.lotheader` / `.lotpack` data.
- Index local `.pack`, PNG, and `.tiles` data from the selected `media` folder.
- Preserve imported squares as ordered sprite/object stacks.
- Browse searchable furniture categories with thumbnails and multi-tile placement.
- Edit with Pencil, Erase, Rectangle, Picker, and Pan tools.
- Preview tiles and furniture before placement and choose between stacked objects with Picker.
- Use a PZmap.org helper to visually find a location, then paste its World X / Y coordinates into the loader.
- Automatically snap compatible tabletop items such as TVs and radios onto a supporting table/counter when one exists at the destination cell; the same item can still be placed on the floor elsewhere.
- Save projects as JSON and open them later.

## Quick start

1. Open the site.
2. Click **Load PZ Location**.
3. Select the local `steamapps/common/ProjectZomboid/media` folder. under 
4. Enter the World X and World Y coordinates of the location you want, or use **Choose with PZmap.org** to open the external map and paste coordinates back into the loader.
5. Load the building or area.
6. Browse **Tiles** or **Furniture**, use **View Filters** when walls or roofs are in the way, and decorate the map.
7. Use **Save as .json** to keep the project.

## Privacy

Project Zomboid files are selected and parsed locally in the browser. The application does not automatically send map files, project files, world coordinates, local paths, or imported content anywhere. If you explicitly click **Open PZmap.org**, that external site opens in a new tab; no coordinates are added to the link by this tool.

## Open source and forks

I am releasing this project under the **GNU General Public License v2.0 or later (GPL-2.0-or-later)**. The project is based in part on GPL-covered Project Zomboid mapping-tool work, so keeping the project under a compatible open-source license is important.

You are welcome to use, study, modify, redistribute, and fork the project under the terms of the license. If you publish a fork or redistribute the project, I ask that you keep the **PZ Online Decoration Tool** attribution and the upstream credits in `CREDITS.md` intact, and clearly state when your version has been modified. The GPL license and upstream notices remain the controlling legal terms.

No Project Zomboid game assets are included in this repository.

## Credits

This project would not exist without the Project Zomboid mapping/modding community and the mapping tools that came before it. I have kept the detailed acknowledgements in [CREDITS.md](CREDITS.md).

PZ Online Decoration Tool is an unofficial community project and is not affiliated with or endorsed by The Indie Stone.

## License

The project is distributed under **GPL-2.0-or-later**. See `LICENSE`, `NOTICE`, `CREDITS.md`, and the license texts under `licenses/`.

> **AI development disclosure:** PZ Online Decoration Tool and its website were developed with substantial assistance from generative AI, including code generation, debugging, documentation, and UI implementation. Project direction, requirements, testing, review, publishing, and maintenance are handled by me.
