# Credits

I built PZ Online Decoration Tool on top of years of work by people in the Project Zomboid and open-source mapping communities. I want those contributions to stay visible in this repository and in forks of it.

## Project Zomboid mapping tools

- **Tim Baker** — creator of the original WorldEd and TileZed foundation used by the Project Zomboid mapping workflow. A large part of the file-format behavior and editor concepts I relied on ultimately comes from this work.
- **Alree / Unjammer** — maintainer of the current unofficial PZ Mapping Tools continuation, including Build 42-era maintenance, compatibility work, fixes, and documentation. The source I used while implementing map import and format handling came from this maintained toolset.
- **Fred “Military Surplus” Cooper** — specially acknowledged by the upstream PZ Mapping Tools project for direct technical contributions.
- **Petro, Pabbiqo [pq], Dane, Cacador, Kyber, шакалоблок**, and the wider **Project Zomboid mapping and modding community** — credited by the upstream project for reports, project files, screenshots, logs, testing, and practical workflow feedback.

## Tiled

TileZed has roots in the open-source Tiled map editor ecosystem. I also want to preserve the upstream credit given to:

- **Thorbjørn Lindeijer** — original Tiled developer and maintainer.
- **Andrew G. Crowell**
- **Christian Henz**
- **Dennis Honeyman**
- **Edward Hutchins**
- **Jeff Bland**
- **Michael Woerister**
- **Roderic Morris**
- **Stefan Beller**
- **Alexander Kuhrt**

The upstream Tiled authorship records also credit translators including Alexander Komarnitsky, Antonio Ricci, Gornova, Bin Wu, Hiroki Utsunomiya, Mauricio Muñoz Lucero, Petr Viktorin, Porfírio Ribeiro, Jānis Kiršteins, Jonatas de Moraes Junior, jurkan, seeseekey, Tamir Atias (KonoM), Thorbjørn Lindeijer, Yohann Ferreira, and Zhao Sting.

## Project Zomboid community

- **The Indie Stone** — creators of Project Zomboid and the game ecosystem this tool is built around. This repository is unofficial and is not affiliated with or endorsed by The Indie Stone.
- The broader **Project Zomboid community**, especially mapping, modding, base-building, documentation, and tooling communities, for the workflows and ideas that made this project useful to build.
- **pzmap.org** — a useful community reference for browsing world coordinates and understanding how players inspect map locations and texture information. No pzmap.org code or assets are bundled here.

## Source and license provenance

The browser implementation is source-derived from and behavior-compatible with parts of the Project Zomboid mapping-tool source tree, including concepts or formats associated with TileZed, BuildingEd, WorldEd, and libtiled. Relevant upstream license texts are kept under `licenses/`.

No Project Zomboid tiles, textures, map binaries, or other game assets are distributed with PZ Online Decoration Tool. Users select their own local game files at runtime.

If you fork or redistribute this project, please keep this file and the PZ Online Decoration Tool attribution so the upstream work remains visible too.
