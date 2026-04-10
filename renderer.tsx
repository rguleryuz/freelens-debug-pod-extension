import { Renderer } from "@k8slens/extensions";
import React from "react";
import {
  DebugSettingsPreferenceHint,
  DebugSettingsPreferenceInput
} from "./src/debug-settings-preference";
import {
  loadDebugSettingsStore,
  resetDebugSettingsStore
} from "./src/debug-settings-store";
import { PodDebugMenuItem } from "./src/pod-debug-menu-item";

export default class FreelensPodDebugRendererExtension extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.Pod>) => (
          <PodDebugMenuItem {...props} />
        )
      }
    }
  ];

  appPreferences = [
    {
      title: "Pod Debug Settings",
      components: {
        Input: () => <DebugSettingsPreferenceInput />,
        Hint: () => <DebugSettingsPreferenceHint />
      }
    }
  ];

  onActivate(): void {
    loadDebugSettingsStore(this);
    console.log("freelens-pod-debug-extension renderer activated");
  }

  onDeactivate(): void {
    resetDebugSettingsStore();
  }
}
