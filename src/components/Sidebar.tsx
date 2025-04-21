import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, checkAdminStatus } = useAuthStore();
  
  // Check admin status when component mounts
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);
  
  return (
    <div className="bg-white h-full shadow-sm">
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary-600">Digitask</h2>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-2 px-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 ${
                location.pathname === '/dashboard' ? 'bg-primary-50 text-primary-600' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
          
          {/* Other menu items */}
          
          {/* Admin section - only visible to admins */}
          {isAdmin && (
            <li className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    to="/admin/reports"
                    className={`flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 ${
                      location.pathname === '/admin/reports' ? 'bg-primary-50 text-primary-600' : ''
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                    <span>User Reports</span>
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 