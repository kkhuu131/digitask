import { useThemeStore } from '../store/themeStore';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import {
  disablePushNotifications,
  enablePushNotifications,
  supportsPushNotifications,
} from '../services/pushNotifications';

interface ReminderPreferences {
  enabled: boolean;
  dailyQuota: boolean;
  scheduledTasks: boolean;
  tournaments: boolean;
  reminderTime: string;
}

const defaultReminderPreferences: ReminderPreferences = {
  enabled: false,
  dailyQuota: true,
  scheduledTasks: true,
  tournaments: true,
  reminderTime: '18:00',
};

const Settings = () => {
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore();
  const { user, userProfile, updateProfile, error: profileError } = useAuthStore();
  const [success] = useState(false);
  const [username, setUsername] = useState(() => userProfile?.username || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [reminders, setReminders] = useState(defaultReminderPreferences);
  const [reminderLoading, setReminderLoading] = useState(true);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderError, setReminderError] = useState('');

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('enabled,daily_quota,scheduled_tasks,tournaments,reminder_time')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      if (error) setReminderError('Unable to load reminder settings.');
      if (data) {
        setReminders({
          enabled: data.enabled,
          dailyQuota: data.daily_quota,
          scheduledTasks: data.scheduled_tasks,
          tournaments: data.tournaments,
          reminderTime: data.reminder_time.slice(0, 5),
        });
      }
      setReminderLoading(false);
    };
    loadPreferences();
    return () => {
      active = false;
    };
  }, [user]);

  const saveReminderPreferences = async () => {
    if (!user) return;
    setReminderSaving(true);
    setReminderMessage('');
    setReminderError('');
    try {
      if (reminders.enabled) await enablePushNotifications(user.id);
      else await disablePushNotifications();

      const { error } = await supabase.from('notification_preferences').upsert({
        user_id: user.id,
        enabled: reminders.enabled,
        daily_quota: reminders.dailyQuota,
        scheduled_tasks: reminders.scheduledTasks,
        tournaments: reminders.tournaments,
        reminder_time: `${reminders.reminderTime}:00`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setReminderMessage(
        reminders.enabled
          ? 'Daily reminder settings saved for this device.'
          : 'Push reminders are turned off.'
      );
    } catch (error) {
      setReminderError(
        error instanceof Error ? error.message : 'Unable to save reminder settings.'
      );
    } finally {
      setReminderSaving(false);
    }
  };

  // Handle system theme preference
  const handleSystemPreference = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setProfileLoading(true);

    try {
      await updateProfile({
        username: username,
        // Also update display_name to match username for consistency
        display_name: username,
      });

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Check if this is the demo account
  const isDemoAccount =
    userProfile?.username === 'demo' || userProfile?.id === 'digitaskdemo@gmail.com';

  return (
    <div className="ui-page max-w-2xl">
      <div className="mb-6">
        <h1 className="ui-page-title">Settings</h1>
        <p className="ui-description">Manage your profile and appearance.</p>
      </div>
      {/* User Profile Settings */}
      <div className="card mb-6">
        <h2 className="ui-section-title mb-4">Profile Settings</h2>

        {isDemoAccount ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Profile settings are disabled for the demo account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is how your name will appear to other users.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input type="text" id="email" value={user?.email} className="input" disabled />
            </div>

            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Show profile update success message */}
        {updateSuccess && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Show profile error message */}
        {profileError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{profileError}</p>
          </div>
        )}
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h2 className="ui-section-title mb-4">App Settings</h2>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Theme</h3>
          <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-gray-300">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  aria-label="Dark mode"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-accent-600 rounded-full peer dark:bg-dark-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-300 peer-checked:bg-accent-600"></div>
              </label>
            </div>
          </div>

          <button onClick={handleSystemPreference} className="btn-outline w-full">
            Use System Preference
          </button>
        </section>

        <section className="border-t border-gray-200 pt-6 dark:border-dark-100">
          <h3 className="text-lg font-semibold dark:text-gray-200">Push Reminders</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Receive one daily summary when enabled goals still need your attention.
          </p>

          {reminderLoading ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading reminders...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {!supportsPushNotifications() && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                  Install Digitask and open it from your home screen to enable push notifications on
                  supported devices.
                </p>
              )}

              <label className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 dark:bg-dark-400">
                <span>
                  <span className="block font-medium dark:text-gray-300">Daily push reminder</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Permission is requested only when you save this setting.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={(event) =>
                    setReminders((current) => ({ ...current, enabled: event.target.checked }))
                  }
                  className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                />
              </label>

              <div className={!reminders.enabled ? 'pointer-events-none opacity-50' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reminder time
                  <input
                    type="time"
                    step="900"
                    value={reminders.reminderTime}
                    onChange={(event) =>
                      setReminders((current) => ({
                        ...current,
                        reminderTime: event.target.value,
                      }))
                    }
                    className="input mt-1"
                    disabled={!reminders.enabled}
                  />
                </label>

                <div className="mt-4 space-y-2">
                  {[
                    ['dailyQuota', 'Daily quota', 'Remind me how many tasks remain for today.'],
                    ['scheduledTasks', 'Scheduled tasks', 'Include incomplete tasks due soon.'],
                    [
                      'tournaments',
                      'Weekly tournament',
                      'Remind me when my weekly entry is unused.',
                    ],
                  ].map(([key, label, description]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3 dark:border-dark-100"
                    >
                      <span>
                        <span className="block text-sm font-medium dark:text-gray-300">
                          {label}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {description}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={reminders[key as keyof ReminderPreferences] as boolean}
                        onChange={(event) =>
                          setReminders((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                        disabled={!reminders.enabled}
                        className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-primary w-full"
                onClick={saveReminderPreferences}
                disabled={reminderSaving}
              >
                {reminderSaving ? 'Saving...' : 'Save Reminder Settings'}
              </button>
              {reminderMessage && <p className="text-sm text-green-600">{reminderMessage}</p>}
              {reminderError && <p className="text-sm text-red-600">{reminderError}</p>}
            </div>
          )}
        </section>

        {/* Battle Speed Settings
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Battle Speed</h3>
          <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Adjust the speed of battle animations
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">1x (Normal)</span>
                <button 
                  onClick={() => saveBattleSpeed(1)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 1 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">1.5x (Fast)</span>
                <button 
                  onClick={() => saveBattleSpeed(1.5)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 1.5 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2x (Very Fast)</span>
                <button 
                  onClick={() => saveBattleSpeed(2)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 2 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
            </div>
          </div>
        </section> */}

        {/* Settings saved message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Settings saved successfully!
            </p>
          </div>
        )}
      </div>

      {/* About section with app info
      <div className="card mt-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">About Digitask</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>Version: 0.1.0</p>
          <p>Digitask is a productivity app where you raise a virtual Digimon pet by completing tasks.</p>
          <p className="mt-4 text-xs">
            This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Settings;
