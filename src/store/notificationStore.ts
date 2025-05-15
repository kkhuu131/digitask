import { create } from "zustand";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  persistent?: boolean;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  // Check if localStorage is available (browser environment)
  const isLocalStorageAvailable = typeof localStorage !== "undefined";

  // Load initial notifications from localStorage if available
  const savedNotifications = isLocalStorageAvailable
    ? localStorage.getItem("notifications")
    : null;
  const initialNotifications = savedNotifications
    ? JSON.parse(savedNotifications)
    : [];

  return {
    notifications: initialNotifications,

    addNotification: (notification) => {
      // Generate a unique ID using timestamp + random string
      const id = Date.now() + Math.random().toString(36).substring(2, 9);

      set((state) => ({
        notifications: [...state.notifications, { ...notification, id }],
      }));

      // Auto-remove after timeout
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    },

    removeNotification: (id) => {
      set((state) => {
        const filteredNotifications = state.notifications.filter(
          (n) => n.id !== id
        );
        // Only try to save to localStorage if it's available
        if (isLocalStorageAvailable) {
          localStorage.setItem(
            "notifications",
            JSON.stringify(filteredNotifications)
          );
        }
        return { notifications: filteredNotifications };
      });
    },

    clearNotifications: () => {
      // Only try to save to localStorage if it's available
      if (isLocalStorageAvailable) {
        localStorage.removeItem("notifications");
      }
      set({ notifications: [] });
    },
  };
});
