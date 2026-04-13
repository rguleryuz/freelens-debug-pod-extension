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
    Configure the kubectl debug command used by "Debug Pod". The debug image runs as an ephemeral container. Extra flags
    are appended before the shell argument.
  </span>
);
