import { Main } from "@k8slens/extensions";
import {
  loadDebugSettingsStore,
  resetDebugSettingsStore
} from "./src/debug-settings-store";

export default class FreelensPodDebugMainExtension extends Main.LensExtension {
  onActivate(): void {
    loadDebugSettingsStore(this);
    console.log("freelens-pod-debug-extension activated");
  }

  onDeactivate(): void {
    resetDebugSettingsStore();
    console.log("freelens-pod-debug-extension de-activated");
  }
}
