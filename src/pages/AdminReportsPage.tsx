import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  reporter_username: string;
  reported_username: string;
  reported_user_id: string;
  reason: string;
  category: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
  admin_notes: string | null;
}

const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('pending');
  const { user, isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  
  // Check if user is admin, if not redirect
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({
        message: 'You do not have permission to access this page',
        type: 'error'
      });
    }
  }, [isAdmin, navigate, addNotification]);
  
  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        
        if (isAdminError || !isAdminData) {
          navigate('/');
          addNotification({
            message: 'You do not have permission to access this page',
            type: 'error'
          });
          return;
        }
        
        // Query the reports table directly without using foreign key relationships
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (reportsError) throw reportsError;
        
        // Filter reports if needed
        const filteredReports = filter !== 'all' 
          ? reportsData.filter(report => report.status === filter)
          : reportsData;
        
        // Then fetch the usernames separately
        const reporterIds = filteredReports.map(report => report.reporter_id);
        const reportedIds = filteredReports.map(report => report.reported_user_id);
        const allUserIds = [...new Set([...reporterIds, ...reportedIds])];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', allUserIds);
        
        if (profilesError) throw profilesError;
        
        // Create a map of user IDs to usernames with proper typing
        const usernameMap: Record<string, string> = {};
        profilesData.forEach(profile => {
          usernameMap[profile.id] = profile.username;
        });
        
        // Combine the data
        const formattedReports = filteredReports.map(report => ({
          id: report.id,
          reporter_id: report.reporter_id,
          reported_user_id: report.reported_user_id,
          reason: report.reason,
          category: report.category,
          status: report.status,
          admin_notes: report.admin_notes,
          created_at: report.created_at,
          updated_at: report.updated_at,
          resolved_at: report.resolved_at,
          reporter_username: usernameMap[report.reporter_id] || 'Unknown User',
          reported_username: usernameMap[report.reported_user_id] || 'Unknown User'
        }));
        
        setReports(formattedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        addNotification({
          message: 'Failed to load reports',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchReports();
    }
  }, [filter, isAdmin, addNotification, navigate, user]);
  
  const handleUpdateStatus = async (reportId: string, status: 'resolved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: notes || null,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (error) throw error;
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status, 
              admin_notes: notes || null,
              resolved_at: status === 'resolved' ? new Date().toISOString() : null
            } 
          : report
      ));
      
      addNotification({
        message: `Report ${status === 'resolved' ? 'resolved' : 'rejected'} successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating report:', error);
      addNotification({
        message: 'Failed to update report',
        type: 'error'
      });
    }
  };
  
  const handleRenameUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_rename_user', {
        user_id: userId
      });
      
      if (error) throw error;
      
      // Update local state to show the new username
      setReports(reports.map(report => 
        report.reported_user_id === userId 
          ? { ...report, reported_username: data } 
          : report
      ));
      
      addNotification({
        message: `User renamed successfully to ${data}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error renaming user:', error);
      addNotification({
        message: 'Failed to rename user',
        type: 'error'
      });
    }
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Reports Administration</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-md ${
              filter === 'resolved' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md ${
              filter === 'rejected' 
                ? 'bg-red-100 text-red-800 border border-red-300' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            All Reports
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} reports found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <ReportRow 
                  key={report.id} 
                  report={report} 
                  onUpdateStatus={handleUpdateStatus}
                  onRenameUser={handleRenameUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface ReportRowProps {
  report: Report;
  onUpdateStatus: (reportId: string, status: 'resolved' | 'rejected', notes?: string) => Promise<void>;
  onRenameUser: (userId: string) => Promise<void>;
}

const ReportRow: React.FC<ReportRowProps> = ({ report, onUpdateStatus, onRenameUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(report.admin_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'offensive_username':
        return 'Offensive Username';
      case 'harassment':
        return 'Harassment';
      case 'inappropriate_content':
        return 'Inappropriate Content';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'resolved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const handleResolve = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(report.id, 'resolved', notes);
    setIsSubmitting(false);
  };
  
  const handleReject = async () => {
    setIsSubmitting(true);
    await onUpdateStatus(report.id, 'rejected', notes);
    setIsSubmitting(false);
  };
  
  const handleRename = async () => {
    await onRenameUser(report.reported_user_id);
  };
  
  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{report.reported_username}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{report.reporter_username}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{getCategoryLabel(report.category)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{formatDate(report.created_at)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(report.status)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-primary-600 hover:text-primary-900"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </td>
      </tr>
      
      {expanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Report Reason:</h3>
                <p className="mt-1 text-sm text-gray-600">{report.reason}</p>
              </div>
              
              {report.status === 'pending' && (
                <>
                  <div>
                    <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700">
                      Admin Notes
                    </label>
                    <textarea
                      id="admin-notes"
                      rows={3}
                      className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Add notes about this report..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    {report.category === 'offensive_username' && (
                      <button
                        onClick={handleRename}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Rename User
                      </button>
                    )}
                    
                    <button
                      onClick={handleResolve}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                      {isSubmitting ? 'Processing...' : 'Resolve Report'}
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100"
                    >
                      {isSubmitting ? 'Processing...' : 'Reject Report'}
                    </button>
                  </div>
                </>
              )}
              
              {report.status !== 'pending' && (
                <>
                  {report.admin_notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Admin Notes:</h3>
                      <p className="mt-1 text-sm text-gray-600">{report.admin_notes}</p>
                    </div>
                  )}
                  
                  {report.resolved_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Resolved At:</h3>
                      <p className="mt-1 text-sm text-gray-600">{formatDate(report.resolved_at)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminReportsPage; 