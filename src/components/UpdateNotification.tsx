import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENT_VERSION, UPDATE_CHANGES } from '../constants/updateInfo';

const UpdateNotification = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (lastSeenVersion !== CURRENT_VERSION) {
      setShowNotification(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
    setShowNotification(false);
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">🎉 Update {CURRENT_VERSION}</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600 mb-4">What's new in this update:</p>
              <ul className="list-disc pl-5 space-y-2">
                {UPDATE_CHANGES[CURRENT_VERSION].map((change, index) => (
                  <li key={index} className="text-gray-700">{change}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="mt-6 w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification; 