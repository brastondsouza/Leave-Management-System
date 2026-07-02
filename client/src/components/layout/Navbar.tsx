import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-2xs sm:px-6">
      <div className="flex items-center gap-4">
        {/* Toggle Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Company Logo in Navbar */}
        <div className="flex items-center gap-2 select-none">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-brand-650 text-white font-extrabold shadow-sm shadow-brand-500/10">
            LF
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-sans">
            LeaveFlow <span className="text-brand-650 font-black">HRMS</span>
          </span>
        </div>

        {/* Divider */}
        <span className="text-slate-350 font-light select-none">|</span>

        {/* Page Title */}
        <h1 className="text-xs sm:text-sm font-bold text-slate-500 font-sans tracking-tight">
          {title}
        </h1>
      </div>

      <div className="relative flex items-center">
        {/* Click-outside backdrop overlay when dropdown is open */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-30 bg-transparent"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Profile Trigger Button */}
        {user && (
          <div className="relative z-40">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-1.5 pr-3 text-left hover:bg-slate-50 transition-all duration-150 focus:outline-hidden"
            >
              {/* Avatar with initials */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold text-xs border border-brand-100 select-none shadow-2xs">
                {getInitials(user.name)}
              </div>
              
              {/* Text metadata */}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-400 leading-none capitalize">
                  {user.role}
                </p>
              </div>

              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            <div
              className={`absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg ring-1 ring-black/5 transition-all duration-255 ${
                isDropdownOpen
                  ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
                  : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              {/* User details header header */}
              <div className="px-3.5 py-3 border-b border-slate-100 mb-2">
                <p className="text-sm font-extrabold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{user.email}</p>
                
                {/* Badge tags */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-150 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {user.department}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50/50 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
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
