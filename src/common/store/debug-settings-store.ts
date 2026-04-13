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
