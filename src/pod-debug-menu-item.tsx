import React from "react";
import { Renderer } from "@k8slens/extensions";
import { getDebugSettingsStore } from "./debug-settings-store";

const {
  Component: { MenuItem, Icon, Notifications, terminalStore },
  Navigation
} = Renderer;

type Pod = Renderer.K8sApi.Pod;
type KubeObjectMenuProps = Renderer.Component.KubeObjectMenuProps<Pod>;

const DEFAULT_DEBUG_IMAGE = "nicolaka/netshoot:latest";
const DEFAULT_SHELL_PROFILE = "/bin/bash";

function quoteArg(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function tokenizeArgs(raw: string): string[] {
  if (!raw.trim()) {
    return [];
  }

  const tokens: string[] = [];
  const regex = /\"([^\"]*)\"|'([^']*)'|([^\s]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }

  return tokens;
}

function buildKubectlDebugCommand(pod: Pod): string {
  const podName = pod.getName();
  const namespace = pod.getNs();
  const container = pod.getContainers()[0]?.name;
  const settings = getDebugSettingsStore();
  const debugImage = settings?.debugImage?.trim() || DEFAULT_DEBUG_IMAGE;
  const shellProfile = settings?.shellProfile?.trim() || DEFAULT_SHELL_PROFILE;
  const extraArgs = tokenizeArgs(settings?.extraArgs || "");

  const args = [
    "kubectl",
    "debug",
    "-it",
    `pod/${podName}`,
    "-n",
    namespace,
    "--image",
    debugImage
  ];

  args.push(...extraArgs);

  if (container) {
    args.push("--target", container);
  }

  if (shellProfile) {
    args.push("--", shellProfile);
  }

  return args.map(quoteArg).join(" ");
}

export function PodDebugMenuItem(props: KubeObjectMenuProps): React.ReactElement | null {
  const { object: pod, toolbar } = props;

  if (!pod) {
    return null;
  }

  const runPodDebug = (): void => {
    const command = buildKubectlDebugCommand(pod);

    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true
    });

    Notifications.ok(`Started debug terminal for pod ${pod.getName()}`);
    Navigation.hideDetails();
  };

  return (
    <MenuItem onClick={runPodDebug}>
      <Icon material="bug_report" interactive={toolbar} title="Run kubectl debug" />
      <span className="title">Debug Pod (kubectl)</span>
    </MenuItem>
  );
}
