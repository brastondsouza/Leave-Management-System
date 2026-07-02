import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const location = useLocation();

  // Determine the Navbar title based on the path
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Employee Dashboard';
      case '/apply-leave':
        return 'Apply for Leave';
      case '/leave-history':
        return 'My Leave History';
      case '/admin/dashboard':
        return 'HR Admin Dashboard';
      case '/admin/requests':
        return 'Manage Leave Requests';
      default:
        return 'LeaveFlow HR';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Collapsible Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Page Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={getPageTitle(location.pathname)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
