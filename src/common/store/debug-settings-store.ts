import { Common } from "@freelensapp/extensions";
import { observable } from "mobx";

export type DebugProfile = "general" | "baseline" | "restricted" | "netadmin" | "sysadmin";

export const DEBUG_PROFILES: DebugProfile[] = ["general", "baseline", "restricted", "netadmin", "sysadmin"];

export interface DebugSettingsModel {
  debugImage: string;
  shellProfile: string;
  profile: DebugProfile;
  extraArgs: string;
}

const DEFAULTS: DebugSettingsModel = {
  debugImage: "nicolaka/netshoot:latest",
  shellProfile: "/bin/bash",
  profile: "general",
  extraArgs: "",
};

export class DebugSettingsStore extends Common.Store.ExtensionStore<DebugSettingsModel> {
  @observable accessor debugImage = DEFAULTS.debugImage;
  @observable accessor shellProfile = DEFAULTS.shellProfile;
  @observable accessor profile: DebugProfile = DEFAULTS.profile;
  @observable accessor extraArgs = DEFAULTS.extraArgs;

  constructor() {
    super({
      configName: "freelens-pod-debug-settings",
      defaults: DEFAULTS,
    });
  }

  fromStore(data: Partial<DebugSettingsModel>): void {
    this.debugImage = data.debugImage ?? DEFAULTS.debugImage;
    this.shellProfile = data.shellProfile ?? DEFAULTS.shellProfile;
    this.profile = data.profile ?? DEFAULTS.profile;
    this.extraArgs = data.extraArgs ?? DEFAULTS.extraArgs;
  }

  toJSON(): DebugSettingsModel {
    return {
      debugImage: this.debugImage,
      shellProfile: this.shellProfile,
      profile: this.profile,
      extraArgs: this.extraArgs,
    };
  }
}
