import { Common } from "@k8slens/extensions";

export interface DebugSettingsModel {
  debugImage: string;
  shellProfile: string;
  extraArgs: string;
}

const DEFAULTS: DebugSettingsModel = {
  debugImage: "nicolaka/netshoot:latest",
  shellProfile: "/bin/bash",
  extraArgs: ""
};

export class DebugSettingsStore extends Common.Store.ExtensionStore<DebugSettingsModel> {
  debugImage = DEFAULTS.debugImage;
  shellProfile = DEFAULTS.shellProfile;
  extraArgs = DEFAULTS.extraArgs;

  constructor() {
    super({
      configName: "freelens-pod-debug-settings",
      defaults: DEFAULTS
    });
  }

  protected fromStore(data: Partial<DebugSettingsModel>): void {
    this.debugImage = data.debugImage || DEFAULTS.debugImage;
    this.shellProfile = data.shellProfile || DEFAULTS.shellProfile;
    this.extraArgs = data.extraArgs || DEFAULTS.extraArgs;
  }

  toJSON(): DebugSettingsModel {
    return {
      debugImage: this.debugImage,
      shellProfile: this.shellProfile,
      extraArgs: this.extraArgs
    };
  }
}

let debugSettingsStore: DebugSettingsStore | undefined;

export function getDebugSettingsStore(): DebugSettingsStore {
  if (!debugSettingsStore) {
    debugSettingsStore = new DebugSettingsStore();
  }

  return debugSettingsStore;
}

export function loadDebugSettingsStore(extension: Common.LensExtension): void {
  const store = getDebugSettingsStore() as DebugSettingsStore & {
    loadExtension?: (arg: Common.LensExtension) => void;
    load?: () => void;
  };

  if (store.loadExtension) {
    store.loadExtension(extension);
    return;
  }

  store.load?.();
}

export function resetDebugSettingsStore(): void {
  debugSettingsStore = undefined;
}
