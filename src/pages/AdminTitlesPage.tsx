import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Title, TITLES } from '../constants/titles';
import { RefreshCw } from 'lucide-react';

const AdminTitlesPage = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({ message: 'You do not have permission to access this page', type: 'error' });
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
      addNotification({ message: 'Failed to load titles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const syncTitles = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('titles').upsert(
        TITLES.map(({ id, name, description, category, requirement_type, requirement_value }) => ({
          id,
          name,
          description,
          category,
          requirement_type,
          requirement_value,
        })),
        { onConflict: 'id' }
      );
      if (error) throw error;
      addNotification({ message: 'Titles synchronized successfully', type: 'success' });
      fetchTitles();
    } catch (error) {
      console.error('Error syncing titles:', error);
      addNotification({ message: 'Failed to sync titles', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Titles Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Sync title definitions from constants to the database.
          </p>
        </div>
        <button
          onClick={syncTitles}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-accent-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-accent-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync from Constants'}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 dark:border-accent-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
              <thead className="bg-gray-50 dark:bg-dark-400">
                <tr>
                  {['ID', 'Name', 'Description', 'Category', 'Requirement', 'Value'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-100">
                {titles.map((title) => (
                  <tr
                    key={title.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {title.id}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {title.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                      {title.description}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-accent-900/40 dark:text-accent-300">
                        {title.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {title.requirement_type}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {title.requirement_value}
                    </td>
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
