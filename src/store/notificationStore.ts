import { create } from "zustand";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  persistent?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => {
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
      const id = Date.now().toString();

      set((state) => {
        // Check if a similar notification already exists
        const existingSimilar = state.notifications.find(
          (n) =>
            n.message === notification.message && n.type === notification.type
        );

        // If a similar notification exists, don't add a new one
        if (existingSimilar) {
          return state;
        }

        const updatedNotifications = [
          ...state.notifications,
          { ...notification, id },
        ];

        // Limit the number of notifications to prevent overflow
        const limitedNotifications = updatedNotifications.slice(-5);

        // Only try to save to localStorage if it's available
        if (isLocalStorageAvailable) {
          localStorage.setItem(
            "notifications",
            JSON.stringify(limitedNotifications)
          );
        }

        return { notifications: limitedNotifications };
      });

      // Auto-dismiss non-persistent notifications after 5 seconds
      if (!notification.persistent) {
        setTimeout(() => {
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
        }, 5000);
      }
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
