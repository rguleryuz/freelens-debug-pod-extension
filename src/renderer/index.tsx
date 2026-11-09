import { Renderer } from "@freelensapp/extensions";
import { DebugSettingsStore } from "../common/store";
import { withMenuItemErrorBoundary } from "./components/error-boundary";
import "./index.css";
import { PodDebugMenuItem } from "./menus/pod-debug-menu-item";
import { DebugSettingsPreferenceHint, DebugSettingsPreferenceInput } from "./preferences/debug-settings-preference";

export default class PodDebugRendererExtension extends Renderer.LensExtension {
  async onActivate() {
    DebugSettingsStore.getInstanceOrCreate().loadExtension(this);
  }

  kubeObjectMenuItems: Renderer.LensExtension["kubeObjectMenuItems"] = [
    Renderer.K8sApi.menuItemFor(Renderer.K8sApi.Pod, { MenuItem: PodDebugMenuItem }),
  ].map((registration) => withMenuItemErrorBoundary(this, registration));

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
