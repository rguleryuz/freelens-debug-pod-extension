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
