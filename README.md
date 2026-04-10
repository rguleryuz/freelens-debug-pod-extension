# FreeLens Pod Debug Extension

A simple FreeLens/Lens extension that adds a **Debug Pod (kubectl)** action for Pod resources.

When you click the action from a Pod menu, it opens a terminal tab in FreeLens and runs:

```sh
kubectl debug -it pod/<pod-name> -n <namespace> --image nicolaka/netshoot:latest --target <first-container>
```

`--target` is included only when the Pod has at least one container.

You can configure command behavior from FreeLens Preferences:

- Debug image
- Shell profile (for example `/bin/bash` or `/bin/sh`)
- Extra `kubectl debug` flags

## Prerequisites

- FreeLens or Lens with extension support
- Node.js 18+
- npm

## Install dependencies

```sh
npm install
```

## Build

```sh
npm run build
```

## Develop (watch mode)

```sh
npm run dev
```

## Install into FreeLens

```sh
mkdir -p ~/.k8slens/extensions
ln -s "$(pwd)" ~/.k8slens/extensions/freelens-pod-debug-extension
```

Restart or reload FreeLens after building.

## Usage

1. Open any cluster.
2. Go to Workloads -> Pods.
3. Open the Pod actions menu (three dots).
4. Click **Debug Pod (kubectl)**.

A terminal opens and runs the generated debug command.

## Configure Preferences

1. Open **Preferences** in FreeLens.
2. Find **Pod Debug Settings**.
3. Set **Debug Image**, **Shell Profile**, and optional **Extra kubectl debug flags**.

Settings are persisted using an extension store and are reused for future debug commands.
