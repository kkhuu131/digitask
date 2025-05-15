import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Title, TITLES } from '../constants/titles';

const AdminTitlesPage = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({
        message: 'You do not have permission to access this page',
        type: 'error'
      });
    } else {
      fetchTitles();
    }
  }, [isAdmin, navigate, addNotification]);
  
  const fetchTitles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('titles')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      setTitles(data || []);
    } catch (error) {
      console.error('Error fetching titles:', error);
      addNotification({
        message: 'Failed to load titles',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const syncTitles = async () => {
    try {
      // Insert all titles from constants
      const { error } = await supabase
        .from('titles')
        .upsert(
          TITLES.map(({ id, name, description, category, requirement_type, requirement_value }) => ({
            id,
            name,
            description,
            category,
            requirement_type,
            requirement_value
          })),
          { onConflict: 'id' }
        );
        
      if (error) throw error;
      
      addNotification({
        message: 'Titles synchronized successfully',
        type: 'success'
      });
      
      fetchTitles();
    } catch (error) {
      console.error('Error syncing titles:', error);
      addNotification({
        message: 'Failed to sync titles',
        type: 'error'
      });
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Titles Manager</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Titles Database</h2>
          <button
            onClick={syncTitles}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sync Titles from Constants
          </button>
        </div>
        
        {loading ? (
          <p className="text-center py-4">Loading titles...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {titles.map(title => (
                  <tr key={title.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{title.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{title.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{title.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{title.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{title.requirement_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{title.requirement_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTitlesPage; 