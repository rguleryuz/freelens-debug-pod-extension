import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { DebugSettingsStore, DEBUG_PROFILES, type DebugProfile } from "../../common/store";

const {
  Component: { Input, Select },
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
        <label>Debug Profile</label>
        <Select
          value={store.profile}
          options={DEBUG_PROFILES.map((p) => ({ value: p, label: p }))}
          onChange={(option) => {
            store.profile = (option?.value as DebugProfile) ?? "general";
          }}
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
    Configure the kubectl debug command used by "Debug Pod". The debug image runs as an ephemeral container. The profile
    controls the security context of the debug container (e.g. "general" adds SYS_PTRACE for /proc access). Extra flags
    are appended before the shell argument.
  </span>
);
