import { Common, Renderer } from "@freelensapp/extensions";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { DebugSettingsStore } from "../../common/store";

const {
  Component: { createTerminalTab, terminalStore, MenuItem, SubMenu, StatusBrick, Notifications, Icon },
  Navigation,
} = Renderer;

const { Util, App } = Common;

type Pod = Renderer.K8sApi.Pod;

const DEFAULT_DEBUG_IMAGE = "nicolaka/netshoot:latest";
const DEFAULT_SHELL_PROFILE = "/bin/bash";

function tokenizeArgs(raw: string): string[] {
  if (!raw.trim()) return [];

  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }

  return tokens;
}

function buildDebugCommand(pod: Pod, containerName: string, settings: DebugSettingsStore): string[] {
  const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
  const debugImage = settings.debugImage?.trim() || DEFAULT_DEBUG_IMAGE;
  const shellProfile = settings.shellProfile?.trim() || DEFAULT_SHELL_PROFILE;
  const extraArgs = tokenizeArgs(settings.extraArgs || "");

  const parts = [kubectlPath, "debug", "-it", pod.getName(), "-n", pod.getNs(), "--image", debugImage];

  if (extraArgs.length > 0) {
    parts.push(...extraArgs);
  }

  if (containerName) {
    parts.push("--target", containerName);
  }

  parts.push("--", shellProfile);

  if (os.platform() !== "win32") {
    parts.unshift("exec");
  }

  return parts;
}

export interface PodDebugMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Pod> {}

export function PodDebugMenuItem(props: PodDebugMenuItemProps) {
  const { object: pod, toolbar } = props;

  if (!pod) return null;

  const containers = pod.getRunningContainers();
  const statuses = pod.getContainerStatuses();

  if (!containers.length) return null;

  const settings = DebugSettingsStore.getInstanceOrCreate<DebugSettingsStore>();

  const runDebug = (containerName: string) => {
    const parts = buildDebugCommand(pod, containerName, settings);
    const tabId = uuidv4();

    createTerminalTab({
      title: `Debug: ${pod.getName()} (namespace: ${pod.getNs()})`,
      id: tabId,
    });

    terminalStore.sendCommand(parts.join(" "), {
      enter: true,
      tabId,
    });

    Notifications.ok(`Started debug session for pod ${pod.getName()}`);
    Navigation.hideDetails();
  };

  return (
    <MenuItem onClick={Util.prevDefault(() => runDebug(containers[0].name))}>
      <Icon material="bug_report" interactive={toolbar} tooltip={toolbar && "Debug Pod (kubectl)"} />
      <span className="title">Debug Pod</span>
      {containers.length > 1 && (
        <>
          <Icon className="arrow" material="keyboard_arrow_right" />
          <SubMenu>
            {containers.map((container) => {
              const { name } = container;
              const status = statuses.find((s) => s.name === name);
              const brick = status ? <StatusBrick /> : null;

              return (
                <MenuItem key={name} onClick={Util.prevDefault(() => runDebug(name))} className="flex align-center">
                  {brick}
                  <span>{name}</span>
                </MenuItem>
              );
            })}
          </SubMenu>
        </>
      )}
    </MenuItem>
  );
}
