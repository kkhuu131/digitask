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
              ${notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 
                notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : 
                'bg-blue-100 border-l-4 border-blue-500'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <p className="text-sm whitespace-pre-line">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-500 hover:text-gray-700"
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