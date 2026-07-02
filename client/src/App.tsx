import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Route Guards
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleBasedRoute from './components/routing/RoleBasedRoute';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import LeaveBalance from './pages/LeaveBalance';
import EmployeeCalendar from './pages/EmployeeCalendar';
import AdminDashboard from './pages/AdminDashboard';
import ManageRequests from './pages/ManageRequests';
import ManageEmployees from './pages/ManageEmployees';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* React Hot Toast configurations */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              border: '1px solid #f1f5f9',
            },
            success: {
              iconTheme: {
                primary: '#0ea5e9',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Employee & Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Root redirects to correct dashboard depending on role */}
            <Route index element={<RootRedirect />} />
            
            {/* Employee Pages */}
            <Route
              path="dashboard"
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="apply-leave"
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <ApplyLeave />
                </RoleBasedRoute>
              }
            />
            <Route
              path="leave-history"
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <LeaveHistory />
                </RoleBasedRoute>
              }
            />
            <Route
              path="leave-balance"
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <LeaveBalance />
                </RoleBasedRoute>
              }
            />
            <Route
              path="calendar"
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <EmployeeCalendar />
                </RoleBasedRoute>
              }
            />
            <Route path="profile" element={<Settings />} />

            {/* Admin/Manager Pages */}
            <Route
              path="admin/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/requests"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ManageRequests />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/employees"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ManageEmployees />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/calendar"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <CalendarView />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Settings />
                </RoleBasedRoute>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
