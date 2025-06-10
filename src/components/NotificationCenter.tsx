import React, { useEffect, useState } from 'react';
import { useNotificationStore } from "../store/notificationStore";
import { motion, AnimatePresence } from "framer-motion";

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (notifications.length === 0) return null;
  
  return (
    <div 
      className={`fixed z-[9999] flex flex-col gap-2 p-4 pointer-events-none
        ${isMobile 
          ? 'top-0 left-0 right-0 items-center' 
          : 'bottom-4 right-4 max-w-sm'}`}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: isMobile ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? -20 : 20 }}
            className={`rounded-lg shadow-lg p-4 pointer-events-auto
              ${notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-600' 
                : notification.type === 'error' 
                ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600' 
                : notification.type === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-600'
                : 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-600'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <p className={`text-sm whitespace-pre-line
                  ${notification.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : notification.type === 'error' 
                    ? 'text-red-800 dark:text-red-200' 
                    : notification.type === 'warning'
                    ? 'text-yellow-800 dark:text-yellow-200'
                    : 'text-blue-800 dark:text-blue-200'}`}
                >
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter; 