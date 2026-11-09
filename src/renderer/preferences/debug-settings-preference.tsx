import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { DEBUG_PROFILES, type DebugProfile, DebugSettingsStore } from "../../common/store";

const {
  Component: { Input, Select },
} = Renderer;

const store = DebugSettingsStore.getInstanceOrCreate<DebugSettingsStore>();

export const DebugSettingsPreferenceInput = observer(() => {
  return (
    <div className="pod-debug-settings">
      <div className="pod-debug-field">
        <label htmlFor="pod-debug-image">Debug Image</label>
        <Input
          id="pod-debug-image"
          value={store.debugImage}
          onChange={(value) => {
            store.debugImage = value;
          }}
          placeholder="nicolaka/netshoot:latest"
        />
      </div>
      <div className="pod-debug-field">
        <label htmlFor="pod-debug-shell">Shell Profile</label>
        <Input
          id="pod-debug-shell"
          value={store.shellProfile}
          onChange={(value) => {
            store.shellProfile = value;
          }}
          placeholder="/bin/bash"
        />
      </div>
      <div className="pod-debug-field">
        <label htmlFor="pod-debug-profile">Debug Profile</label>
        <Select
          inputId="pod-debug-profile"
          value={store.profile}
          options={DEBUG_PROFILES.map((p) => ({ value: p, label: p }))}
          onChange={(option) => {
            store.profile = (option?.value as DebugProfile) ?? "general";
          }}
        />
      </div>
      <div className="pod-debug-field">
        <label htmlFor="pod-debug-extra-args">Extra kubectl debug flags</label>
        <Input
          id="pod-debug-extra-args"
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
    Configure the kubectl debug command used by "Debug Pod". The debug image runs as an ephemeral container. The profile
    controls the security context of the debug container (e.g. "general" adds SYS_PTRACE for /proc access). Extra flags
    are appended before the shell argument.
  </span>
);
