import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Calendar,
  Settings,
  X,
  User,
  Activity,
  Briefcase,
  Layers,
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
      category: 'Workspace',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { name: 'Apply Leave', path: '/apply-leave', icon: <Calendar className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Management',
      items: [
        { name: 'Leave History', path: '/leave-history', icon: <FileSpreadsheet className="h-4 w-4" /> },
        { name: 'Leave Balance', path: '/leave-balance', icon: <Activity className="h-4 w-4" /> },
        { name: 'Company Calendar', path: '/calendar', icon: <Calendar className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Personal',
      items: [
        { name: 'Profile', path: '/profile', icon: <User className="h-4 w-4" /> },
      ]
    }
  ];

  const adminLinks = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Operations',
      items: [
        { name: 'Pending Requests', path: '/admin/requests', icon: <FileSpreadsheet className="h-4 w-4" /> },
        { name: 'Employees', path: '/admin/employees', icon: <Users className="h-4 w-4" /> },
        { name: 'Calendar', path: '/admin/calendar', icon: <Calendar className="h-4 w-4" /> },
      ]
    },
    {
      category: 'Configuration',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
      ]
    }
  ];

  const groupedLinks = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity duration-300"
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
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-150 bg-white">
          <div className="flex items-center gap-2.5 select-none">
            {/* Unified Brand Theme Logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-black shadow-lg shadow-brand-600/20 text-xs tracking-wider">
              LF
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight font-sans">
              LeaveFlow<span className="text-brand-600 font-semibold">HR</span>
            </span>
          </div>

          {/* Close Menu Button (Mobile view alternative) */}
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all lg:hidden focus:outline-hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Content Matrix */}
        <nav className="flex-1 space-y-6 px-3.5 py-6 overflow-y-auto custom-scrollbar">
          {groupedLinks.map((group) => (
            <div key={group.category} className="space-y-1">
              {/* Category Subheadings */}
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80">
                {group.category}
              </p>
              
              {/* Navigation Items */}
              <div className="space-y-0.5">
                {group.items.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-900'
                      }`}
                    >
                      {/* Consistent Icon Container and Colors */}
                      <span className={`transition-colors duration-150 ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'
                      }`}>
                        {link.icon}
                      </span>
                      
                      <span className="tracking-tight">{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Premium Contextual Footer Node */}
        {user && (
          <div className="border-t border-slate-150 p-3.5 bg-slate-50/40">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 border border-slate-200/50">
                {user.role === 'admin' ? (
                  <Layers className="h-4 w-4 text-brand-600" />
                ) : (
                  <Briefcase className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-slate-800 uppercase tracking-wide leading-tight">
                  {user.role === 'admin' ? 'HR Administrator' : (user.designation || 'Staff Associate')}
                </p>
                
                {/* Live System Synchronization Tag */}
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium tracking-tight">
                    Secured Node Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;