import { Main } from "@freelensapp/extensions";
import { DebugSettingsStore } from "../common/store";

export default class PodDebugMainExtension extends Main.LensExtension {
  async onActivate() {
    await DebugSettingsStore.getInstanceOrCreate().loadExtension(this);
  }
}
