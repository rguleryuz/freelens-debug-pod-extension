import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";

type MenuRegistration = Renderer.LensExtension["kubeObjectMenuItems"][number];

interface ErrorBoundaryProps {
  extension: Renderer.LensExtension;
  resetKey?: unknown;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
  resetKey?: unknown;
}

/**
 * Keeps a render error of a menu item inside the item: the host has no boundary around extension menu items, so
 * an uncaught error would take down the whole cluster view. Renders nothing after an error, and retries for a new
 * object. Trimmed from freelensapp/freelens-example-extension (MIT).
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): ErrorBoundaryState | null {
    return Object.is(props.resetKey, state.resetKey) ? null : { failed: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    Common.logger.error(`[${this.props.extension.name}]: ${error}`, info.componentStack);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function withMenuItemErrorBoundary(
  extension: Renderer.LensExtension,
  registration: MenuRegistration,
): MenuRegistration {
  const { MenuItem } = registration.components;

  return {
    ...registration,
    components: {
      ...registration.components,
      // biome-ignore lint/correctness/noComponentHookFactories: built once per registration, not during render
      MenuItem: (props) => (
        <ErrorBoundary extension={extension} resetKey={props.object}>
          <MenuItem {...props} />
        </ErrorBoundary>
      ),
    },
  };
}
