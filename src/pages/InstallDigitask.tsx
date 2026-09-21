import { useEffect, useState } from 'react';
import { CheckCircle2, Download, MoreVertical, Share, Smartphone } from 'lucide-react';
import {
  BeforeInstallPromptEvent,
  clearInstallPrompt,
  getInstallPrompt,
  subscribeToInstallPrompt,
} from '../utils/pwaInstall';

const installSteps = {
  ios: [
    'Open Digitask in Safari on your iPhone or iPad.',
    'Tap the Share button in the Safari toolbar.',
    'Scroll down, choose Add to Home Screen, then tap Add.',
    'Open the installed app, go to Settings, and enable Push Reminders.',
  ],
  android: [
    'Open Digitask in Chrome on your Android phone or tablet.',
    'Tap the three-dot browser menu.',
    'Choose Install app or Add to Home screen, then confirm.',
    'Open the installed app, go to Settings, and enable Push Reminders.',
  ],
};

const InstallDigitask = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    getInstallPrompt()
  );
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const updateInstalledState = () => {
      setIsInstalled(standaloneQuery.matches || navigatorWithStandalone.standalone === true);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
    };

    updateInstalledState();
    const unsubscribeFromInstallPrompt = subscribeToInstallPrompt(setInstallPrompt);
    standaloneQuery.addEventListener('change', updateInstalledState);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      unsubscribeFromInstallPrompt();
      standaloneQuery.removeEventListener('change', updateInstalledState);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') clearInstallPrompt();
  };

  return (
    <div className="ui-page max-w-4xl">
      <div className="card">
        <div className="mx-auto max-w-2xl text-center">
          <img
            src="/assets/digimon/agumon_professor.png"
            alt="Professor Agumon"
            className="mx-auto h-20 w-20 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="ui-page-title mt-4 justify-center text-3xl">Install Digitask</h1>
          <p className="ui-description mt-3 text-base">
            Add Digitask to your home screen and launch it like a mobile app. There is no separate
            App Store or Play Store download, and you can keep using the same Digitask account.
          </p>

          {isInstalled ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Digitask is already installed on this device
            </div>
          ) : installPrompt ? (
            <button type="button" className="btn-primary mt-6" onClick={handleInstall}>
              <Download className="h-5 w-5" aria-hidden="true" />
              Install Digitask
            </button>
          ) : (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Follow the instructions for your device below. Browser menu wording can vary slightly.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="ui-panel p-5 sm:p-6" aria-labelledby="ios-install-heading">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400">
                <Share className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  iPhone &amp; iPad
                </p>
                <h2 id="ios-install-heading" className="ui-section-title">
                  Install from Safari
                </h2>
              </div>
            </div>
            <ol className="space-y-4">
              {installSteps.ios.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 font-heading text-xs font-bold text-accent-600 dark:bg-accent-900/30 dark:text-accent-300">
                    {index + 1}
                  </span>
                  <span className="pt-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="ui-panel p-5 sm:p-6" aria-labelledby="android-install-heading">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400">
                <MoreVertical className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Android
                </p>
                <h2 id="android-install-heading" className="ui-section-title">
                  Install from Chrome
                </h2>
              </div>
            </div>
            <ol className="space-y-4">
              {installSteps.android.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 font-heading text-xs font-bold text-accent-600 dark:bg-accent-900/30 dark:text-accent-300">
                    {index + 1}
                  </span>
                  <span className="pt-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-100 dark:bg-dark-200">
          <Smartphone
            className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            For the smoothest setup, sign in before installing. Digitask will remember your session
            and open in its own app window from your home screen. Notifications are optional and
            must be enabled from Digitask Settings after installation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallDigitask;
