import React from 'react';
import { UserTitle } from '../store/titleStore';
import { supabase } from '../lib/supabase';
import { useNotificationStore } from '../store/notificationStore';

interface TitleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: UserTitle[];
  displayedTitles: UserTitle[];
}

const TitleSelectionModal: React.FC<TitleSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  titles, 
  displayedTitles 
}) => {
  const { addNotification } = useNotificationStore();
  
  if (!isOpen) return null;
  
  const toggleTitleDisplay = async (titleId: number, currentlyDisplayed: boolean) => {
    try {
      // If we're adding a new displayed title and already have 3, find the oldest one to remove
      let titlesToUpdate = [{ id: titleId, is_displayed: !currentlyDisplayed }];
      
      if (!currentlyDisplayed && displayedTitles.length >= 3) {
        // Find the oldest displayed title to un-display
        const oldestDisplayedTitle = displayedTitles
          .sort((a, b) => new Date(a.earned_at).getTime() - new Date(b.earned_at).getTime())[0];
        
        titlesToUpdate.push({ id: oldestDisplayedTitle.id, is_displayed: false });
      }
      
      // Update the titles in the database
      const { error } = await supabase
        .from('user_titles')
        .upsert(titlesToUpdate, { onConflict: 'id' });
      
      if (error) throw error;
      
      addNotification({
        message: 'Title display preferences updated',
        type: 'success'
      });
      
      // Close the modal and refresh
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating title display:', error);
      addNotification({
        message: 'Failed to update title display',
        type: 'error'
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select Display Titles</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Select up to 3 titles to display on your profile. If you select more than 3, 
          the oldest selected title will be automatically unselected.
        </p>
        
        <div className="space-y-2">
          {titles.map(userTitle => (
            <div 
              key={userTitle.id} 
              className={`flex items-center justify-between p-3 rounded cursor-pointer ${
                userTitle.is_displayed ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'
              }`}
              onClick={() => toggleTitleDisplay(userTitle.id, userTitle.is_displayed)}
            >
              <div>
                <span className="font-medium">{userTitle.title?.name}</span>
                <p className="text-sm text-gray-500">{userTitle.title?.description}</p>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={userTitle.is_displayed} 
                  onChange={() => {}} // Handled by the div onClick
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleSelectionModal; 