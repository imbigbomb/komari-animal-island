# Komari Animal Island

[简体中文](README.md) | [English](README_EN.md)

![Komari Animal Island preview](preview.png)

A simple and cozy game-style Komari monitoring theme built with Animal Island UI.

Author: **JeraldMaster**<br>
Developed by **OpenAI Codex**

## Features

- Animal Island styled dashboard, server cards, list view, and detail modal
- Komari RPC2 live updates with compatibility for the legacy live API
- Configurable data refresh interval, defaulting to 3 seconds
- Sorting by name, CPU, memory, or network speed, with offline nodes placed last by default
- Region filtering, server search, light/dark appearance, and managed theme settings
- Single-line latency and task-name-matched three-network latency
- Billing cycle, renewal date, remaining value, and Animal Island UI Wallet display
- Custom title, subtitle, and PNG logo
- ICP and public security filing information in the footer
- Animal Island UI forms, buttons, tags, selects, progress bars, Wallet, Loading, cursor, BackTop, and other components

## Installation

Download the latest `AnimalIsland-version.zip` from [Releases](https://github.com/imbigbomb/komari-animal-island/releases), then upload and enable it in Komari Theme Management.

Do not use GitHub's automatically generated Source code archives.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

A Komari theme archive must contain the following entries at its root:

```text
komari-theme.json
preview.png
dist/
```

## Theme conventions

- Managed theme settings are declared in `komari-theme.json`.
- `dist/index.html` preserves Komari's standard site metadata placeholders.
- The theme only handles the public monitoring page and does not replace `/admin` or `/terminal`.
- The page retains the `Powered by Komari Monitor.` attribution.
- Main page structures use semantic `km-` class names for compatibility and maintenance.

## References and acknowledgements

Thanks to the following projects and their authors for the platform, components, and functional design references:

- [Komari](https://github.com/komari-monitor/komari): runtime platform and monitoring APIs.
- [Komari Web](https://github.com/komari-monitor/komari-web): reference for authentication flow, public APIs, and real-time data behavior.
- [Komari theme development documentation](https://komari-document.pages.dev/dev/theme): theme structure, managed configuration, and publishing conventions.
- [Animal Island UI](https://github.com/guokaigdg/animal-island-ui): UI components, icons, animations, and visual foundation used by this theme.
- [MiStatus-Komari](https://github.com/imzyb/MiStatus-Komari): reference for organizing monitoring information and card/list functionality.
- [Komari Theme Emerald](https://github.com/Tokinx/komari-theme-emerald): functional reference for task-based three-network latency matching, configurable data refresh intervals, offline-node ordering, and ICP/public-security filing settings.

This theme is independently implemented in React. No page or component code from Komari Web, MiStatus-Komari, or Komari Theme Emerald was copied into this project.

## License and disclaimer

This project is licensed under [CC BY-NC 4.0](LICENSE) for non-commercial use only. Attribution and the license notice must be retained when using or redistributing it.

This is an unofficial fan-made theme and is not affiliated with, authorized, sponsored, or endorsed by Nintendo Co., Ltd. or its affiliates. Animal Crossing names, characters, trademarks, and related assets belong to their respective owners.

Third-party names, trademarks, character artwork, remote images, and third-party elements visible in preview images are not covered by this project's license. Verify the required rights before public redistribution or commercial use, and replace them with assets you own where appropriate.

See [NOTICE.md](NOTICE.md) for details.
