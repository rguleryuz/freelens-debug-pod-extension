# freelens-pod-debug-extension

A Freelens extension that adds a **Debug Pod (kubectl)** action to the pod context menu.

## Features

- Adds a "Debug Pod" menu item to the pod right-click menu
- Runs `kubectl debug -it` targeting the selected pod
- Container picker submenu when a pod has multiple containers
- Configurable debug image (default: `nicolaka/netshoot:latest`)
- Configurable shell profile (default: `/bin/bash`)
- Extra kubectl debug flags via preferences

## Requirements

- Freelens >= 1.8.0
- Node.js >= 22.0.0
- `kubectl` available in PATH

## Install

Build from source:

```sh
pnpm install
pnpm build
pnpm pack
```

Then in Freelens, go to Extensions (Cmd+Shift+E) and provide the path to the `.tgz` tarball.

## Configuration

Go to Freelens Preferences and find the "Pod Debug Settings" section:

- **Debug Image** — container image for the debug container
- **Shell Profile** — shell to launch inside the debug container
- **Extra kubectl debug flags** — additional flags like `--profile=general` or `--share-processes`

## License

MIT
