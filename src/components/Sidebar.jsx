import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Target,
  CheckSquare,
  FileText,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/daily-log', icon: Calendar, label: 'Daily Log' },
  { to: '/growth', icon: Target, label: 'Growth' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/notes', icon: FileText, label: 'Notes' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token (adjust key if you use different storage)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    toast.success('Logged out successfully');
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) toggleSidebar();

    // Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl
          transition-transform duration-300 ease-in-out z-50
          w-64 lg:w-20 xl:w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close (mobile) */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h1
              className={`
                font-bold text-xl text-indigo-600 dark:text-indigo-400
                lg:opacity-0 xl:opacity-100 transition-opacity
              `}
            >
              Advance Todo
            </h1>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`
                      lg:opacity-0 xl:opacity-100 transition-opacity
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
              `}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span
                className={`
                  lg:opacity-0 xl:opacity-100 transition-opacity font-medium
                `}
              >
                Logout
              </span>
            </button>
          </div>

          {/* Desktop Collapse Button */}
          <div className="hidden lg:flex items-center justify-center p-4 border-t dark:border-gray-700">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isOpen ? 'Collapse' : 'Expand'}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;