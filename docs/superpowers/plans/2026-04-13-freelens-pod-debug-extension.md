# Freelens Pod Debug Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Freelens extension that adds a "Debug Pod (kubectl)" context menu item to pods, opening a terminal with `kubectl debug`.

**Architecture:** The extension follows the modern Freelens extension structure using `@freelensapp/extensions`, `electron-vite`, `pnpm`, and `mobx`. It registers a `kubeObjectMenuItems` entry for Pod v1 that builds a `kubectl debug` command and sends it to a new terminal tab. User preferences (debug image, shell, extra args) are persisted via an `ExtensionStore`. When a pod has multiple containers, a `SubMenu` lets the user pick the target container.

**Tech Stack:** TypeScript, React 17, `@freelensapp/extensions` 1.8+, `electron-vite`, `mobx`/`mobx-react`, `pnpm`

---

## File Structure

```
/ (repo root)
  src/
    main/
      index.ts                              # Main process entry — loads settings store
    renderer/
      index.tsx                             # Renderer entry — registers menu item + preferences
      menus/
        pod-debug-menu-item.tsx             # Pod context menu with container picker submenu
    common/
      store/
        index.ts                            # Barrel export for store
        debug-settings-store.ts             # ExtensionStore for debug image, shell, extra args
  package.json                              # Extension manifest + dependencies
  electron.vite.config.js                   # Vite build config (main + renderer)
  tsconfig.json                             # TypeScript config
  biome.jsonc                               # Linter config
  .gitignore                                # Build artifacts, node_modules, etc.
  .nvmrc                                    # Node version
  .editorconfig                             # Editor settings
  LICENSE                                   # MIT license
  README.md                                 # Extension documentation
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `electron.vite.config.js`
- Create: `tsconfig.json`
- Create: `biome.jsonc`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `.editorconfig`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "freelens-pod-debug-extension",
  "version": "0.1.0",
  "description": "Freelens extension that adds kubectl debug action for pods",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/AnyVersion/freelens-pod-debug-extension.git"
  },
  "main": "out/main/index.js",
  "renderer": "out/renderer/index.js",
  "files": [
    "out/**/*"
  ],
  "engines": {
    "node": ">= 22.0.0",
    "freelens": "^1.8.0"
  },
  "license": "MIT",
  "author": "orion",
  "scripts": {
    "type:check": "tsc --noEmit -p tsconfig.json --composite false",
    "prebuild": "pnpm type:check",
    "build": "electron-vite build",
    "build:force": "electron-vite build",
    "clean": "rm -rf out",
    "pack:dev": "pnpm build:force && pnpm pack"
  },
  "devDependencies": {
    "@babel/plugin-proposal-decorators": "^7.29.0",
    "@electron-toolkit/tsconfig": "^2.0.0",
    "@freelensapp/extensions": "^1.8.0",
    "@types/node": "~22.19.8",
    "@types/react": "^17.0.90",
    "@vitejs/plugin-react": "^5.1.3",
    "electron-vite": "^5.0.0",
    "mobx": "6.13.7",
    "mobx-react": "7.6.0",
    "react": "17.0.2",
    "typescript": "5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-external": "^6.2.2"
  },
  "packageManager": "pnpm@10.28.2"
}
```

- [ ] **Step 2: Create `electron.vite.config.js`**

```js
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import pluginExternal from "vite-plugin-external";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, "src/main/index.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          exports: "named",
          preserveModules: (process.env.VITE_PRESERVE_MODULES ?? "true") === "true",
          preserveModulesRoot: "src/main",
        },
      },
      sourcemap: true,
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "@babel/plugin-proposal-decorators",
              {
                version: "2023-05",
              },
            ],
          ],
        },
      }),
      externalizeDepsPlugin({
        include: ["@freelensapp/extensions", "mobx"],
      }),
      pluginExternal({
        externals: {
          "@freelensapp/extensions": "global.LensExtensions",
          mobx: "global.Mobx",
        },
      }),
    ],
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, "src/renderer/index.tsx"),
        formats: ["cjs"],
      },
      outDir: "out/renderer",
      rollupOptions: {
        output: {
          exports: "named",
          preserveModules: (process.env.VITE_PRESERVE_MODULES ?? "true") === "true",
          preserveModulesRoot: "src/renderer",
        },
      },
      sourcemap: true,
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "@babel/plugin-proposal-decorators",
              {
                version: "2023-05",
              },
            ],
          ],
        },
      }),
      externalizeDepsPlugin({
        include: [
          "@freelensapp/extensions",
          "electron",
          "mobx",
          "mobx-react",
          "react",
          "react-dom",
          "react-router-dom",
        ],
        exclude: [],
      }),
      pluginExternal({
        externals: {
          "@freelensapp/extensions": "global.LensExtensions",
          mobx: "global.Mobx",
          "mobx-react": "global.MobxReact",
          react: "global.React",
          "react-dom": "global.ReactDom",
          "react-router-dom": "global.ReactRouterDom",
          "react/jsx-runtime": "global.ReactJsxRuntime",
        },
      }),
    ],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "include": ["*.ts", "src/**/*"],
  "compilerOptions": {
    "composite": true,
    "esModuleInterop": true,
    "moduleResolution": "node10",
    "jsx": "react-jsx",
    "types": ["vite/client", "electron-vite/node"],
    "paths": {
      "@vitejs/plugin-react": ["./node_modules/@vitejs/plugin-react/dist/index.d.ts"]
    }
  }
}
```

- [ ] **Step 4: Create `biome.jsonc`**

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.3.14/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "files": {
    "includes": ["**", "!**/out/**", "!**/node_modules/**"]
  },
  "vcs": {
    "clientKind": "git",
    "enabled": true,
    "useIgnoreFile": true
  }
}
```

- [ ] **Step 5: Create `.gitignore`, `.nvmrc`, `.editorconfig`**

`.gitignore`:
```
*.d.ts
*.gz
*.lock
*.log
*.map
*.out
*.tgz
*.tmp
*~

!custom.d.ts
!env.d.ts

/node_modules/
/out/

*.DS_Store
/.idea
/.vscode
```

`.nvmrc`:
```
22.21.1
```

`.editorconfig`:
```
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: lockfile generated, `node_modules/` populated, no errors

- [ ] **Step 7: Commit**

```bash
git add package.json electron.vite.config.js tsconfig.json biome.jsonc .gitignore .nvmrc .editorconfig
git commit -m "chore: scaffold freelens-pod-debug-extension project"
```

---

### Task 2: Debug Settings Store

**Files:**
- Create: `src/common/store/debug-settings-store.ts`
- Create: `src/common/store/index.ts`

- [ ] **Step 1: Create `src/common/store/debug-settings-store.ts`**

```ts
import { Common } from "@freelensapp/extensions";
import { makeObservable, observable } from "mobx";

export interface DebugSettingsModel {
  debugImage: string;
  shellProfile: string;
  extraArgs: string;
}

const DEFAULTS: DebugSettingsModel = {
  debugImage: "nicolaka/netshoot:latest",
  shellProfile: "/bin/bash",
  extraArgs: "",
};

export class DebugSettingsStore extends Common.Store.ExtensionStore<DebugSettingsModel> {
  @observable accessor debugImage = DEFAULTS.debugImage;
  @observable accessor shellProfile = DEFAULTS.shellProfile;
  @observable accessor extraArgs = DEFAULTS.extraArgs;

  constructor() {
    super({
      configName: "freelens-pod-debug-settings",
      defaults: DEFAULTS,
    });
    makeObservable(this);
  }

  fromStore(data: DebugSettingsModel): void {
    this.debugImage = data.debugImage ?? DEFAULTS.debugImage;
    this.shellProfile = data.shellProfile ?? DEFAULTS.shellProfile;
    this.extraArgs = data.extraArgs ?? DEFAULTS.extraArgs;
  }

  toJSON(): DebugSettingsModel {
    return {
      debugImage: this.debugImage,
      shellProfile: this.shellProfile,
      extraArgs: this.extraArgs,
    };
  }
}
```

- [ ] **Step 2: Create `src/common/store/index.ts`**

```ts
export * from "./debug-settings-store";
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm type:check`
Expected: No type errors (or only errors from missing renderer/main files — those are created next)

- [ ] **Step 4: Commit**

```bash
git add src/common/
git commit -m "feat: add debug settings store with configurable image, shell, and extra args"
```

---

### Task 3: Main Process Entry

**Files:**
- Create: `src/main/index.ts`

- [ ] **Step 1: Create `src/main/index.ts`**

```ts
import { Main } from "@freelensapp/extensions";
import { DebugSettingsStore } from "../common/store";

export default class PodDebugMainExtension extends Main.LensExtension {
  async onActivate() {
    await DebugSettingsStore.getInstanceOrCreate().loadExtension(this);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main/
git commit -m "feat: add main process entry that loads debug settings"
```

---

### Task 4: Pod Debug Menu Item

**Files:**
- Create: `src/renderer/menus/pod-debug-menu-item.tsx`

- [ ] **Step 1: Create `src/renderer/menus/pod-debug-menu-item.tsx`**

This is the core component. It shows a "Debug Pod" menu item with a container submenu when multiple containers exist. On click, it builds the `kubectl debug` command and runs it in a new terminal tab.

```tsx
import { Common, Renderer } from "@freelensapp/extensions";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { DebugSettingsStore } from "../../common/store";

const {
  Component: { createTerminalTab, terminalStore, MenuItem, SubMenu, StatusBrick, Notifications, Icon },
  Navigation,
} = Renderer;

const { Util, App } = Common;

type Pod = Renderer.K8sApi.Pod;

const DEFAULT_DEBUG_IMAGE = "nicolaka/netshoot:latest";
const DEFAULT_SHELL_PROFILE = "/bin/bash";

function tokenizeArgs(raw: string): string[] {
  if (!raw.trim()) return [];

  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }

  return tokens;
}

function buildDebugCommand(pod: Pod, containerName: string, settings: DebugSettingsStore): string[] {
  const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
  const debugImage = settings.debugImage?.trim() || DEFAULT_DEBUG_IMAGE;
  const shellProfile = settings.shellProfile?.trim() || DEFAULT_SHELL_PROFILE;
  const extraArgs = tokenizeArgs(settings.extraArgs || "");

  const parts = [
    kubectlPath,
    "debug",
    "-it",
    pod.getName(),
    "-n",
    pod.getNs(),
    "--image",
    debugImage,
  ];

  if (extraArgs.length > 0) {
    parts.push(...extraArgs);
  }

  if (containerName) {
    parts.push("--target", containerName);
  }

  parts.push("--", shellProfile);

  if (os.platform() !== "win32") {
    parts.unshift("exec");
  }

  return parts;
}

export interface PodDebugMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Pod> {}

export function PodDebugMenuItem(props: PodDebugMenuItemProps) {
  const { object: pod, toolbar } = props;

  if (!pod) return null;

  const containers = pod.getRunningContainers();
  const statuses = pod.getContainerStatuses();

  if (!containers.length) return null;

  const settings = DebugSettingsStore.getInstanceOrCreate<DebugSettingsStore>();

  const runDebug = (containerName: string) => {
    const parts = buildDebugCommand(pod, containerName, settings);
    const tabId = uuidv4();

    createTerminalTab({
      title: `Debug: ${pod.getName()} (namespace: ${pod.getNs()})`,
      id: tabId,
    });

    terminalStore.sendCommand(parts.join(" "), {
      enter: true,
      tabId,
    });

    Notifications.ok(`Started debug session for pod ${pod.getName()}`);
    Navigation.hideDetails();
  };

  return (
    <MenuItem onClick={Util.prevDefault(() => runDebug(containers[0].name))}>
      <Icon material="bug_report" interactive={toolbar} tooltip={toolbar && "Debug Pod (kubectl)"} />
      <span className="title">Debug Pod</span>
      {containers.length > 1 && (
        <>
          <Icon className="arrow" material="keyboard_arrow_right" />
          <SubMenu>
            {containers.map((container) => {
              const { name } = container;
              const status = statuses.find((s) => s.name === name);
              const brick = status ? <StatusBrick /> : null;

              return (
                <MenuItem
                  key={name}
                  onClick={Util.prevDefault(() => runDebug(name))}
                  className="flex align-center"
                >
                  {brick}
                  <span>{name}</span>
                </MenuItem>
              );
            })}
          </SubMenu>
        </>
      )}
    </MenuItem>
  );
}
```

- [ ] **Step 2: Add `uuid` dependency**

Run: `pnpm add -D uuid @types/uuid`

- [ ] **Step 3: Commit**

```bash
git add src/renderer/menus/ package.json pnpm-lock.yaml
git commit -m "feat: add pod debug menu item with container picker"
```

---

### Task 5: Debug Settings Preferences UI

**Files:**
- Create: `src/renderer/preferences/debug-settings-preference.tsx`

- [ ] **Step 1: Create `src/renderer/preferences/debug-settings-preference.tsx`**

```tsx
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { DebugSettingsStore } from "../../common/store";

const {
  Component: { Input },
} = Renderer;

const store = DebugSettingsStore.getInstanceOrCreate<DebugSettingsStore>();

export const DebugSettingsPreferenceInput = observer(() => {
  return (
    <div className="flex column gaps">
      <div className="flex column">
        <label>Debug Image</label>
        <Input
          value={store.debugImage}
          onChange={(value) => {
            store.debugImage = value;
          }}
          placeholder="nicolaka/netshoot:latest"
        />
      </div>
      <div className="flex column">
        <label>Shell Profile</label>
        <Input
          value={store.shellProfile}
          onChange={(value) => {
            store.shellProfile = value;
          }}
          placeholder="/bin/bash"
        />
      </div>
      <div className="flex column">
        <label>Extra kubectl debug flags</label>
        <Input
          value={store.extraArgs}
          onChange={(value) => {
            store.extraArgs = value;
          }}
          placeholder="--share-processes --profile=general"
        />
      </div>
    </div>
  );
});

export const DebugSettingsPreferenceHint = () => (
  <span>
    Configure the kubectl debug command used by "Debug Pod". The debug image runs as an ephemeral
    container. Extra flags are appended before the shell argument.
  </span>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/preferences/
git commit -m "feat: add debug settings preferences UI"
```

---

### Task 6: Renderer Entry

**Files:**
- Create: `src/renderer/index.tsx`

- [ ] **Step 1: Create `src/renderer/index.tsx`**

```tsx
import { Renderer } from "@freelensapp/extensions";
import { DebugSettingsStore } from "../common/store";
import { PodDebugMenuItem, type PodDebugMenuItemProps } from "./menus/pod-debug-menu-item";
import { DebugSettingsPreferenceHint, DebugSettingsPreferenceInput } from "./preferences/debug-settings-preference";

export default class PodDebugRendererExtension extends Renderer.LensExtension {
  async onActivate() {
    DebugSettingsStore.getInstanceOrCreate().loadExtension(this);
  }

  kubeObjectMenuItems = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: PodDebugMenuItemProps) => <PodDebugMenuItem {...props} />,
      },
    },
  ];

  appPreferences = [
    {
      title: "Pod Debug Settings",
      components: {
        Input: () => <DebugSettingsPreferenceInput />,
        Hint: () => <DebugSettingsPreferenceHint />,
      },
    },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/index.tsx
git commit -m "feat: add renderer entry registering debug menu and preferences"
```

---

### Task 7: Build & Verify

**Files:**
- No new files — verify existing code compiles and builds

- [ ] **Step 1: Run type check**

Run: `pnpm type:check`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `pnpm build:force`
Expected: `out/main/index.js` and `out/renderer/index.js` generated without errors

- [ ] **Step 3: Verify output files exist**

Run: `ls -la out/main/ out/renderer/`
Expected: Both directories contain `.js` files

- [ ] **Step 4: Fix any build errors**

If there are type or build errors, fix them. Common issues:
- Missing type declarations for `uuid` — ensure `@types/uuid` is installed
- Import paths — ensure all relative imports are correct
- `os` module — may need to be marked as external in vite config (it's a Node.js built-in, should work with `electron-main` target)

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors"
```

---

### Task 8: Documentation

**Files:**
- Create: `README.md`
- Create: `LICENSE`

- [ ] **Step 1: Create `README.md`**

```markdown
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

Then in Freelens, go to Extensions and provide the path to the `.tgz` tarball.

## Configuration

Go to Freelens Preferences and find the "Pod Debug Settings" section:

- **Debug Image** — container image for the debug container
- **Shell Profile** — shell to launch inside the debug container
- **Extra kubectl debug flags** — additional flags like `--profile=general` or `--share-processes`

## License

MIT
```

- [ ] **Step 2: Create `LICENSE`**

Create a standard MIT license file with author "orion" and year 2026.

- [ ] **Step 3: Commit**

```bash
git add README.md LICENSE
git commit -m "docs: add README and LICENSE"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Clean build**

Run: `pnpm clean && pnpm build`
Expected: Clean build completes without errors

- [ ] **Step 2: Pack the extension**

Run: `pnpm pack`
Expected: A `.tgz` file is created in the project root

- [ ] **Step 3: Verify the tarball contents**

Run: `tar tzf *.tgz | head -20`
Expected: Contains `package/out/main/index.js`, `package/out/renderer/index.js`, and `package/package.json`

- [ ] **Step 4: Test in Freelens** (manual)

1. Open Freelens
2. Go to Extensions (Cmd+Shift+E)
3. Drag and drop the `.tgz` file
4. Connect to a cluster
5. Right-click a pod — should see "Debug Pod" menu item
6. Click it — should open a terminal running `kubectl debug`
7. Test with a multi-container pod — should see container submenu
8. Check Preferences — should see "Pod Debug Settings" section
