import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, ChevronDown,  User, Shield } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const getInitials = (name: string = 'User') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md transition-all duration-200 sm:px-6">
      {/* Click-outside backdrop layer */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Left Area: Navigation Controls & Context */}
      <div className="flex items-center gap-3.5">
        {/* Toggle Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="group rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-hidden lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5 transition-transform duration-150 group-active:scale-95" />
        </button>

        {/* Dynamic Page Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-slate-900 font-sans">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Area: Action Items & Profile Panel */}
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        {/* <button 
          className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 focus:outline-hidden transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </button> */}

        <div className="h-4 w-px bg-slate-200/80 mx-1 hidden sm:block" />

        {/* Profile Activation Node */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative z-40 flex items-center gap-2.5 rounded-xl border border-slate-100 p-1 pr-2.5 text-left transition-all duration-200 focus:outline-hidden ${
                isDropdownOpen 
                  ? 'bg-slate-50/80 border-slate-200/60 shadow-xs ring-4 ring-slate-100' 
                  : 'bg-white hover:bg-slate-50/60 hover:border-slate-200/40'
              }`}
            >
              {/* Avatar Hub */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-bold text-[11px] tracking-wide text-white select-none shadow-sm shadow-slate-900/10">
                {getInitials(user.name)}
              </div>
              
              {/* Profile Meta Info */}
              <div className="hidden sm:block max-w-[120px]">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
                  {user.name}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 leading-none truncate capitalize">
                  {user.role || 'Member'}
                </p>
              </div>

              <ChevronDown className={`h-3.5 w-3.5 text-slate-400/80 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-slate-600' : ''
              }`} />
            </button>

            {/* Premium Flyout Dropdown Panel */}
            <div
              className={`absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-xl shadow-slate-900/5 ring-1 ring-black/5 backdrop-blur-xs transition-all duration-200 ${
                isDropdownOpen
                  ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
                  : 'scale-95 opacity-0 -translate-y-1.5 pointer-events-none'
              }`}
            >
              {/* Dropdown Identity Card */}
              <div className="px-3 py-3 border-b border-slate-150/60 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{user.email}</p>
                
                {/* Structural Security/Dept Badges */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                    <Shield className="h-2.5 w-2.5 text-slate-400" /> {user.role || 'User'}
                  </span>
                  {user.department && (
                    <span className="inline-flex items-center rounded-md bg-brand-50/60 border border-brand-100/40 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 uppercase tracking-wider">
                      {user.department}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Options Group */}
              <div className="space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>View Profile</span>
                </Link>
              </div>

              <div className="my-1 border-t border-slate-100" />

              {/* Action Terminal: Sign Out */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;