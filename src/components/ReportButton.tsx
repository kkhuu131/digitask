import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNotificationStore } from '../store/notificationStore';

interface ReportButtonProps {
  userId: string;
  username: string;
  variant?: 'icon' | 'text' | 'menu' | 'icon-only';
}

const ReportButton: React.FC<ReportButtonProps> = ({ 
  userId, 
  username, 
  variant = 'icon' 
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  
  const handleReportClick = () => {
    setShowReportModal(true);
  };
  
  return (
    <>
      {variant === 'icon-only' && (
        <button 
          onClick={handleReportClick}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Report user"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {variant === 'icon' && (
        <button 
          onClick={handleReportClick}
          className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
          title="Report user"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Report</span>
        </button>
      )}
      
      {variant === 'text' && (
        <button 
          onClick={handleReportClick}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Report
        </button>
      )}
      
      {variant === 'menu' && (
        <button 
          onClick={handleReportClick}
          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
          Report user
        </button>
      )}
      
      {showReportModal && (
        <ReportModal 
          userId={userId} 
          username={username} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </>
  );
};

interface ReportModalProps {
  userId: string;
  username: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ userId, username, onClose }) => {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('offensive_username');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotificationStore();
  
  const reportCategories = [
    { value: 'offensive_username', label: 'Offensive Username' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      addNotification({
        message: 'Please provide a reason for your report',
        type: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        addNotification({
          message: 'You must be logged in to report a user',
          type: 'error'
        });
        return;
      }
      
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: userData.user.id,
          reported_user_id: userId,
          reason,
          category
        });
      
      if (error) throw error;
      
      addNotification({
        message: 'Report submitted successfully. Thank you for helping keep our community safe.',
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      addNotification({
        message: 'Failed to submit report. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Report User: {username}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {reportCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Report
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Please provide details about why you're reporting this user..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportButton; 