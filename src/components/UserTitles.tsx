import React, { useState, useEffect } from 'react';
import { UserTitle } from '../store/titleStore';
import { supabase } from '../lib/supabase';
import { useNotificationStore } from '../store/notificationStore';

interface UserTitlesProps {
  titles: UserTitle[];
  isOwnProfile: boolean;
}

const UserTitles: React.FC<UserTitlesProps> = ({ titles: initialTitles, isOwnProfile }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [titles, setTitles] = useState<UserTitle[]>(initialTitles);
  const { addNotification } = useNotificationStore();
  
  // Reset edited titles when initial titles change
  useEffect(() => {
    setTitles(initialTitles);
  }, [initialTitles]);
  
  // Get displayed titles (up to 3)
  const displayedTitles = titles
    .filter(title => title.is_displayed)
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 3);
  
  // All titles for selection in edit mode
  const allTitles = titles.sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime());
  
  const toggleTitleDisplay = (titleId: number, currentlyDisplayed: boolean) => {
    // Update local state for the clicked title
    const updatedTitles = titles.map(title => 
      title.id === titleId 
        ? { ...title, is_displayed: !currentlyDisplayed } 
        : title
    );
    
    // If we're adding a new displayed title and already have 3, find the oldest one to remove
    if (!currentlyDisplayed && displayedTitles.length >= 3) {
      // Find the oldest displayed title to un-display
      const oldestDisplayedTitle = displayedTitles
        .sort((a, b) => new Date(a.earned_at).getTime() - new Date(b.earned_at).getTime())[0];
      
      // Update local state for the oldest title
      const finalUpdatedTitles = updatedTitles.map(title => 
        title.id === oldestDisplayedTitle.id 
          ? { ...title, is_displayed: false } 
          : title
      );
      
      setTitles(finalUpdatedTitles);
    } else {
      setTitles(updatedTitles);
    }
  };
  
  const handleEditModeToggle = async () => {
    if (isEditMode) {
      // User clicked "Done" - save changes to database
      try {
        // Find titles that have changed
        const changedTitles = titles.filter(title => {
          const originalTitle = initialTitles.find(t => t.id === title.id);
          return originalTitle && originalTitle.is_displayed !== title.is_displayed;
        });
        
        if (changedTitles.length > 0) {
          // Prepare updates for database
          const updates = changedTitles.map(title => ({
            id: title.id,
            is_displayed: title.is_displayed
          }));
          
          // Update all changed titles in one batch
          for (const update of updates) {
            const { error } = await supabase
              .from('user_titles')
              .update({ is_displayed: update.is_displayed })
              .eq('id', update.id);
              
            if (error) throw error;
          }
          
          addNotification({
            message: 'Title display preferences updated',
            type: 'success'
          });
        }
      } catch (error) {
        console.error('Error updating title display:', error);
        addNotification({
          message: 'Failed to update title display',
          type: 'error'
        });
        
        // Revert to original titles on error
        setTitles(initialTitles);
      }
    }
    
    // Toggle edit mode
    setIsEditMode(!isEditMode);
  };
  
  if (titles.length === 0) {
    return <p className="text-gray-500 italic">No titles earned yet.</p>;
  }
  
  return (
    <div>
      {/* Header with title and edit button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Titles</h2>
        {isOwnProfile && (
          <button 
            onClick={handleEditModeToggle}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
          >
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      
      {!isEditMode ? (
        // Display mode - show up to 3 displayed titles in the original card style
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayedTitles.length > 0 ? (
            displayedTitles.map(userTitle => (
              <div 
                key={userTitle.id}
                className="relative group bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3"
              >
                <div className="font-medium text-blue-800">
                  {userTitle.title?.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {userTitle.title?.description}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Earned: {new Date(userTitle.earned_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic col-span-3">
              {isOwnProfile 
                ? "You haven't selected any titles to display. Click 'Edit' to choose titles." 
                : "This user hasn't selected any titles to display."}
            </p>
          )}
        </div>
      ) : (
        // Edit mode - show all titles with toggle options
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">Select up to 3 titles to display on your profile:</p>
          <div className="grid grid-cols-1 gap-2">
            {allTitles.map(userTitle => (
              <div 
                key={userTitle.id} 
                className={`flex items-center justify-between p-3 rounded cursor-pointer ${
                  userTitle.is_displayed ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300' : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => toggleTitleDisplay(userTitle.id, userTitle.is_displayed)}
              >
                <div>
                  <div className="font-medium text-blue-800">
                    {userTitle.title?.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {userTitle.title?.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Earned: {new Date(userTitle.earned_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={userTitle.is_displayed} 
                    onChange={() => {}} // Handled by the div onClick
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTitles; 