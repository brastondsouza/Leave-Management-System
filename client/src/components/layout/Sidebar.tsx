import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Calendar,
  Settings,
  Menu,
  User,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const employeeLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Apply Leave',
      path: '/apply-leave',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Leave History',
      path: '/leave-history',
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      name: 'Leave Balance',
      path: '/leave-balance',
      icon: <Activity className="h-5 w-5" />,
    },
    {
      name: 'Company Calendar',
      path: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
  ];

  const adminLinks = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Pending Requests',
      path: '/admin/requests',
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      name: 'Employees',
      path: '/admin/employees',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Calendar',
      path: '/admin/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md">
  {/* Branding & Logo Group */}
  <div className="flex items-center gap-3">
    {/* Logo Icon Box */}
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black select-none shadow-lg shadow-indigo-600/20 text-sm tracking-wider">
      LF
    </div>
    {/* App Title Text */}
    <span className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
      LeaveFlow <span className="text-indigo-600 font-semibold text-lg">HRMS</span>
    </span>
  </div>

  {/* Mobile Menu Button */}
  <button
    onClick={onClose}
    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    aria-label="Close menu"
  >
    <Menu className="h-5 w-5" />
  </button>
</div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`relative flex items-center gap-3.5 rounded-xl px-4.5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-2xs shadow-brand-500/5'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Active marker left vertical line */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-lg bg-brand-600" />
                )}
                
                {/* Icon wrapper to keep vertical alignment consistent */}
                <span className={`transition-colors duration-200 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {link.icon}
                </span>
                
                <span className="tracking-tight">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Workspace Footer details */}
        {user && (
          <div className="border-t border-slate-150 p-4 bg-slate-50/50">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {user.designation || 'Administrator'}
                </p>
                <p className="truncate text-[10px] text-slate-400 font-semibold mt-0.5">
                  HRMS REST Mode
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
