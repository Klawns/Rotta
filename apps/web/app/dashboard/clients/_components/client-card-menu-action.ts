export type ClientCardMenuActionMode = 'immediate' | 'after-close';

interface RunClientCardMenuActionOptions {
  closeMenu: () => void;
  action: () => void;
  mode?: ClientCardMenuActionMode;
  schedule?: (action: () => void) => void;
}

const scheduleAfterClose = (action: () => void) => {
  window.requestAnimationFrame(action);
};

export function runClientCardMenuAction({
  closeMenu,
  action,
  mode = 'immediate',
  schedule = scheduleAfterClose,
}: RunClientCardMenuActionOptions) {
  closeMenu();

  if (mode === 'after-close') {
    schedule(action);
    return;
  }

  action();
}
