import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

type FilterType = 'all' | 'pending' | 'resolved' | 'rejected';

const FILTER_TABS: { key: FilterType; label: string; active: string; inactive: string }[] = [
  {
    key: 'pending',
    label: 'Pending',
    active:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    inactive: '',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    active:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
    inactive: '',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    active:
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
    inactive: '',
  },
  {
    key: 'all',
    label: 'All',
    active:
      'bg-indigo-100 dark:bg-accent-900/30 text-indigo-800 dark:text-accent-300 border-indigo-300 dark:border-accent-700',
    inactive: '',
  },
];

const INACTIVE_TAB =
  'bg-white dark:bg-dark-400 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200';

const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('pending');
  const { user, isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({ message: 'You do not have permission to access this page', type: 'error' });
    }
  }, [isAdmin, navigate, addNotification]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        if (isAdminError || !isAdminData) {
          navigate('/');
          addNotification({
            message: 'You do not have permission to access this page',
            type: 'error',
          });
          return;
        }
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (reportsError) throw reportsError;
        const filteredReports =
          filter !== 'all' ? reportsData.filter((r) => r.status === filter) : reportsData;
        const allUserIds = [
          ...new Set([
            ...filteredReports.map((r) => r.reporter_id),
            ...filteredReports.map((r) => r.reported_user_id),
          ]),
        ];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', allUserIds);
        if (profilesError) throw profilesError;
        const usernameMap: Record<string, string> = {};
        profilesData.forEach((p) => {
          usernameMap[p.id] = p.username;
        });
        setReports(
          filteredReports.map((r) => ({
            ...r,
            reporter_username: usernameMap[r.reporter_id] || 'Unknown',
            reported_username: usernameMap[r.reported_user_id] || 'Unknown',
          }))
        );
      } catch (err) {
        console.error('Error fetching reports:', err);
        addNotification({ message: 'Failed to load reports', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchReports();
  }, [filter, isAdmin, addNotification, navigate, user]);

  const handleUpdateStatus = async (
    reportId: string,
    status: 'resolved' | 'rejected',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: notes || null,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);
      if (error) throw error;
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status,
                admin_notes: notes || null,
                resolved_at: status === 'resolved' ? new Date().toISOString() : null,
              }
            : r
        )
      );
      addNotification({
        message: `Report ${status === 'resolved' ? 'resolved' : 'rejected'} successfully`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error updating report:', err);
      addNotification({ message: 'Failed to update report', type: 'error' });
    }
  };

  const handleRenameUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_rename_user', { user_id: userId });
      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.reported_user_id === userId ? { ...r, reported_username: data } : r))
      );
      addNotification({ message: `User renamed to ${data}`, type: 'success' });
    } catch (err) {
      console.error('Error renaming user:', err);
      addNotification({ message: 'Failed to rename user', type: 'error' });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Review and act on reported users.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${filter === tab.key ? tab.active : INACTIVE_TAB}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 dark:border-accent-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No {filter !== 'all' ? filter : ''} reports found.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-100">
            <thead className="bg-gray-50 dark:bg-dark-400">
              <tr>
                {['Reported User', 'Reporter', 'Category', 'Date', 'Status', 'Actions'].map((h) => (
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

// ── ReportRow ────────────────────────────────────────────────────────────────────

interface ReportRowProps {
  report: Report;
  onUpdateStatus: (
    reportId: string,
    status: 'resolved' | 'rejected',
    notes?: string
  ) => Promise<void>;
  onRenameUser: (userId: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  offensive_username: 'Offensive Username',
  harassment: 'Harassment',
  inappropriate_content: 'Inappropriate Content',
  other: 'Other',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const ReportRow: React.FC<ReportRowProps> = ({ report, onUpdateStatus, onRenameUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(report.admin_notes || '');
  const [submitting, setSubmitting] = useState(false);

  const fmt = (s: string) =>
    new Date(s).toLocaleDateString() + ' ' + new Date(s).toLocaleTimeString();

  const act = async (status: 'resolved' | 'rejected') => {
    setSubmitting(true);
    await onUpdateStatus(report.id, status, notes);
    setSubmitting(false);
  };

  return (
    <>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-dark-400 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {report.reported_username}
        </td>
        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
          {report.reporter_username}
        </td>
        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
          {CATEGORY_LABELS[report.category] ?? report.category}
        </td>
        <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {fmt(report.created_at)}
        </td>
        <td className="px-5 py-3.5">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[report.status] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {report.status}
          </span>
        </td>
        <td className="px-5 py-3.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-accent-400 hover:text-indigo-800 dark:hover:text-accent-300 font-medium cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Details
              </>
            )}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td
            colSpan={6}
            className="px-5 py-4 bg-gray-50 dark:bg-dark-400 border-b border-gray-100 dark:border-dark-100"
          >
            <div className="space-y-4 max-w-2xl">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Report Reason
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{report.reason}</p>
              </div>

              {report.status === 'pending' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-accent-500 transition-colors resize-none"
                      placeholder="Add notes about this report..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {report.category === 'offensive_username' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRenameUser(report.reported_user_id);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 dark:bg-accent-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-accent-700 text-sm font-medium transition-colors cursor-pointer"
                      >
                        Rename User
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        act('resolved');
                      }}
                      disabled={submitting}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Processing…' : 'Resolve'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        act('rejected');
                      }}
                      disabled={submitting}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Processing…' : 'Reject'}
                    </button>
                  </div>
                </>
              )}

              {report.status !== 'pending' && (
                <div className="space-y-2">
                  {report.admin_notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Admin Notes
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {report.admin_notes}
                      </p>
                    </div>
                  )}
                  {report.resolved_at && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Resolved At
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {fmt(report.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AdminReportsPage;
