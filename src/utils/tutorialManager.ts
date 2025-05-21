// Utility to manage tutorial states in localStorage
export interface TutorialState {
  [key: string]: boolean;
}

const TUTORIAL_STORAGE_KEY = "digitask_tutorials";

export const TutorialManager = {
  // Get all tutorial states
  getAll: (): TutorialState => {
    try {
      const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error reading tutorial states:", error);
      return {};
    }
  },

  // Check if a specific tutorial has been completed
  hasCompleted: (tutorialId: string): boolean => {
    const tutorials = TutorialManager.getAll();
    return !!tutorials[tutorialId];
  },

  // Mark a tutorial as completed
  markCompleted: (tutorialId: string): void => {
    try {
      const tutorials = TutorialManager.getAll();
      tutorials[tutorialId] = true;
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorials));
    } catch (error) {
      console.error("Error saving tutorial state:", error);
    }
  },

  // Reset all tutorials (for testing)
  resetAll: (): void => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  },

  // Reset a specific tutorial
  reset: (tutorialId: string): void => {
    try {
      const tutorials = TutorialManager.getAll();
      delete tutorials[tutorialId];
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorials));
    } catch (error) {
      console.error("Error resetting tutorial state:", error);
    }
  },
};
