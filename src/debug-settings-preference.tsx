import React from "react";
import { getDebugSettingsStore } from "./debug-settings-store";

function getStore() {
  return getDebugSettingsStore();
}

export function DebugSettingsPreferenceInput(): React.ReactElement {
  const store = getStore();
  const [debugImage, setDebugImage] = React.useState(store.debugImage);
  const [shellProfile, setShellProfile] = React.useState(store.shellProfile);
  const [extraArgs, setExtraArgs] = React.useState(store.extraArgs);

  return (
    <div className="flex column gaps">
      <label>
        <div>Debug Image</div>
        <input
          className="input"
          type="text"
          value={debugImage}
          onChange={(event) => {
            const value = event.target.value;

            setDebugImage(value);
            store.debugImage = value;
          }}
          placeholder="nicolaka/netshoot:latest"
        />
      </label>

      <label>
        <div>Shell Profile</div>
        <input
          className="input"
          type="text"
          value={shellProfile}
          onChange={(event) => {
            const value = event.target.value;

            setShellProfile(value);
            store.shellProfile = value;
          }}
          placeholder="/bin/bash"
        />
      </label>

      <label>
        <div>Extra kubectl debug flags</div>
        <input
          className="input"
          type="text"
          value={extraArgs}
          onChange={(event) => {
            const value = event.target.value;

            setExtraArgs(value);
            store.extraArgs = value;
          }}
          placeholder="--share-processes --profile=general"
        />
      </label>
    </div>
  );
}

export function DebugSettingsPreferenceHint(): React.ReactElement {
  return (
    <span>
      Configure the command used by "Debug Pod (kubectl)". Extra flags are appended before shell execution.
    </span>
  );
}
