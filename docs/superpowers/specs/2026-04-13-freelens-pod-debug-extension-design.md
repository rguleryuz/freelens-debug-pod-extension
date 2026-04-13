# Freelens Pod Debug Extension - Design Spec

## Overview

A Freelens extension that adds a "Debug Pod (kubectl)" menu item to the Pod context menu. When clicked, it runs `kubectl debug` against the selected pod in a new Freelens terminal tab. Users can configure the debug image, shell, and extra flags via extension preferences.

## Requirements

- Freelens >= 1.8.0
- Node.js >= 22.0.0
- `kubectl` available in the user's PATH

## Architecture

The extension follows the modern Freelens extension structure using `@freelensapp/extensions`, `electron-vite`, `mobx`, and `pnpm` — matching the patterns established by `@freelensapp/example-extension`.

### Project Layout

```
/ (repo root)
  src/
    main/
      index.ts                    # Main process entry
    renderer/
      index.tsx                   # Renderer process entry
      menus/
        pod-debug-menu-item.tsx   # Pod context menu item
        container-picker.tsx      # Container selection submenu
      preferences/
        debug-settings-preference.tsx  # Settings UI
    common/
      store/
        index.ts                  # Store barrel export
        debug-settings-store.ts   # Persistent settings store
  package.json
  electron.vite.config.js
  tsconfig.json
  biome.jsonc
  .gitignore
  LICENSE
  README.md
```

Output: `out/main/index.js` + `out/renderer/index.js`

## Components

### 1. Pod Debug Menu Item

**File:** `src/renderer/menus/pod-debug-menu-item.tsx`

- Registered as `kubeObjectMenuItems` for `kind: "Pod"`, `apiVersions: ["v1"]`
- Displays a "Debug Pod (kubectl)" button with `bug_report` material icon
- On click:
  - If pod has a single container: runs debug immediately targeting that container
  - If pod has multiple containers: shows a container selection submenu
- Builds the kubectl debug command and executes via `terminalStore.sendCommand()`
- Shows a notification confirming the debug session started
- Calls `Navigation.hideDetails()` after launching

### 2. Container Picker

**File:** `src/renderer/menus/container-picker.tsx`

- Renders a `SubMenu` listing all containers in the pod
- Each container is a `MenuItem` entry
- On selection, builds and runs the debug command targeting that container
- Only shown when the pod has more than one container

### 3. Debug Settings Store

**File:** `src/common/store/debug-settings-store.ts`

- Extends `Common.Store.ExtensionStore<DebugSettingsModel>`
- Fields:
  - `debugImage: string` (default: `"nicolaka/netshoot:latest"`)
  - `shellProfile: string` (default: `"/bin/bash"`)
  - `extraArgs: string` (default: `""`)
- Uses `mobx` `@observable` accessor + `makeObservable(this)`
- `fromStore()` loads persisted values
- `toJSON()` serializes current values
- Singleton via `getInstanceOrCreate()`

### 4. Debug Settings Preferences UI

**File:** `src/renderer/preferences/debug-settings-preference.tsx`

- Three text `<Input>` fields for debug image, shell profile, and extra args
- Uses `mobx-react` `observer` for reactivity
- Registered via `appPreferences` in the renderer extension class

### 5. Main Entry

**File:** `src/main/index.ts`

- Extends `Main.LensExtension`
- `onActivate()`: loads the debug settings store

### 6. Renderer Entry

**File:** `src/renderer/index.tsx`

- Extends `Renderer.LensExtension`
- `onActivate()`: loads the debug settings store
- `kubeObjectMenuItems`: registers `PodDebugMenuItem` for Pod v1
- `appPreferences`: registers "Pod Debug Settings" preferences section

## Command Construction

The kubectl debug command is built as:

```
kubectl debug -it pod/<podName> -n <namespace> --image <debugImage> [extraArgs...] --target <selectedContainer> -- <shellProfile>
```

- `podName` and `namespace` come from the Pod object
- `debugImage`, `shellProfile`, and `extraArgs` come from the settings store
- `selectedContainer` is the user's choice (or the only container)
- Arguments are shell-quoted to prevent injection

### Argument Quoting

All arguments are single-quoted with internal single quotes escaped as `'\''` to prevent shell injection.

### Extra Args Tokenization

The `extraArgs` string is tokenized respecting double-quoted and single-quoted substrings, then each token is individually quoted when building the final command.

## Data Flow

1. User right-clicks a Pod in Freelens -> sees "Debug Pod (kubectl)" in context menu
2. Click -> if multiple containers, a submenu lists them; if one container, proceeds directly
3. Command is built from: pod metadata + settings store values + selected container
4. `terminalStore.sendCommand(command, { enter: true, newTab: true })` opens a terminal tab
5. `Notifications.ok(...)` confirms the session started
6. `Navigation.hideDetails()` closes the details panel

## Build & Tooling

- **Build:** `electron-vite` with the same config pattern as the example extension
- **Package manager:** `pnpm`
- **Linting:** `biome` config based on the example extension
- **TypeScript:** `tsconfig.json` extending `@electron-toolkit/tsconfig`
- **Externals:** `@freelensapp/extensions`, `react`, `mobx`, `mobx-react` provided by the host app as globals

## Scope Exclusions

- No dedicated `--profile` dropdown (users add `--profile=X` via extra args field)
- No custom CRDs or cluster pages
- No custom icon assets (uses material icons from the host app)
- No unit tests in initial implementation
