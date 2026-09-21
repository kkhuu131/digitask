export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallPromptListener = (prompt: BeforeInstallPromptEvent | null) => void;

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<InstallPromptListener>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(deferredInstallPrompt));
};

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event as BeforeInstallPromptEvent;
  notifyListeners();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  notifyListeners();
});

export const getInstallPrompt = () => deferredInstallPrompt;

export const clearInstallPrompt = () => {
  deferredInstallPrompt = null;
  notifyListeners();
};

export const subscribeToInstallPrompt = (listener: InstallPromptListener) => {
  listeners.add(listener);
  listener(deferredInstallPrompt);
  return () => listeners.delete(listener);
};
