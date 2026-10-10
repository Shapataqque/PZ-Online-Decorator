# PZ Online Decoration Tool

PZ Online Decoration Tool is a browser-based Project Zomboid base planner for loading an existing location and experimenting with furniture, tiles, roads, decorations, and other map objects outside the game.

The tool reads the selected Project Zomboid `media` folder locally in the browser. Project Zomboid game assets are not included in this repository.

## Features

- Index local `.pack`, PNG, and `.tiles` resources from the Project Zomboid `media` folder.
- Load an existing building, area, or map cell from `.lotheader` and `.lotpack` data.
- Edit imported map objects directly.
- Browse searchable furniture and tile libraries with previews.
- Place multi-tile furniture and cycle alternative appearances with **R**.
- Use Pencil, Erase, Rectangle, Picker, and Pan tools.
- Select specific stacked objects to erase.
- Edit multiple Z levels with reference grids.
- Set explicit placement heights with H-codes and **+ / -** controls.
- Save and reopen projects as JSON.
- Use category-based View Filters to simplify dense scenes.

## Quick start

1. Open the site.
2. Click **Choose Media Folder…** and select `steamapps/common/ProjectZomboid/media`.
3. Wait for the media library to finish indexing.
4. Click **Load World Location**, enter World X / Y, and choose an area, building, or map cell.
5. Select an object from **Furniture** or **Tiles** and edit the scene.
6. Use **Save as .json** to save the project.

## Privacy and local files

Selected game files and project JSON files are parsed locally in the browser and are not uploaded by the application. The external feedback form is loaded only after the **Feedback** button is opened.

## Open source

The project is released under **GPL-2.0-or-later**. It includes source-derived format and behavior work from GPL/BSD-licensed Project Zomboid mapping tools and their upstream Tiled roots. Keep the applicable license and attribution files when redistributing modified versions.

No Project Zomboid game assets are distributed with this repository.

## Credits

Detailed upstream attribution is available in [CREDITS.md](CREDITS.md).

PZ Online Decoration Tool is an unofficial community project and is not affiliated with or endorsed by The Indie Stone.

## License

See `LICENSE`, `NOTICE`, `CREDITS.md`, and the license texts under `licenses/`.


> **AI development disclosure:** PZ Online Decoration Tool and its website were developed with substantial assistance from generative AI, including code generation, debugging, documentation, and UI implementation. Project direction, requirements, testing, review, publishing, and maintenance are handled by me.
