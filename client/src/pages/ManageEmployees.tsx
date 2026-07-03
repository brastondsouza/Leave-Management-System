import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import type { User } from '../api/types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';

// Add Employee Zod Schema
const addEmployeeSchema = zod.object({
  name: zod.string().min(1, 'Name is required').max(50, 'Name must not exceed 50 characters'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  role: zod.enum(['employee', 'admin'] as const),
  department: zod.string().min(1, 'Department is required'),
  designation: zod.string().min(1, 'Designation is required'),
});

type AddEmployeeFormValues = zod.infer<typeof addEmployeeSchema>;

// Edit Employee Zod Schema
const editEmployeeSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod.string().min(1, 'Email is required').email('Invalid email'),
  role: zod.enum(['employee', 'admin'] as const),
  department: zod.string().min(1, 'Department is required'),
  designation: zod.string().min(1, 'Designation is required'),
  casual: zod.number().min(0).max(50),
  sick: zod.number().min(0).max(50),
  earned: zod.number().min(0).max(50),
});

type EditEmployeeFormValues = zod.infer<typeof editEmployeeSchema>;

const ManageEmployees: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State variables
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Modal / Selected employee states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'profile' | 'delete' | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch employees from database
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.getUsers();
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Failed to fetch employees', error);
      toast.error('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Check URL query parameters on load to trigger Add modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setActiveModal('add');
      // Clear parameter from URL to prevent reopening on reload
      navigate('/admin/employees', { replace: true });
    }
  }, [location, navigate]);

  // Add Employee Form Hook
  const addForm = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'General',
      designation: '',
    },
  });

  // Edit Employee Form Hook
  const editForm = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });

  // Fetch current details into edit form on user select
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      casual: user.leaveBalance?.casual ?? 10,
      sick: user.leaveBalance?.sick ?? 8,
      earned: user.leaveBalance?.earned ?? 15,
    });
    setActiveModal('edit');
  };

  // Submit Add Employee Form (triggers real API call)
  const onAddSubmit = async (data: AddEmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const api = (await import('../api/axios')).default;
      await api.post('/auth/register', data);
      
      toast.success(`Employee ${data.name} has been added successfully!`);
      setActiveModal(null);
      addForm.reset();
      await fetchEmployees();
    } catch (error: any) {
      console.error('Registration failed', error);
      const errMsg = error.response?.data?.message || 'Failed to add employee.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Employee Form (triggers real API call)
  const onEditSubmit = async (data: EditEmployeeFormValues) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await authApi.updateUser(selectedUser._id, data);
      toast.success(`Profile for ${data.name} updated successfully!`);
      setActiveModal(null);
      setSelectedUser(null);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Update failed', error);
      const errMsg = error.response?.data?.message || 'Failed to update employee details.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Delete Employee Submit (triggers real API call)
  const handleDeleteEmployee = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await authApi.deleteUser(selectedUser._id);
      toast.success(`Employee account for ${selectedUser.name} has been deleted.`);
      setActiveModal(null);
      setSelectedUser(null);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Delete failed', error);
      const errMsg = error.response?.data?.message || 'Failed to delete employee account.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter ? emp.department === deptFilter : true;
    const matchesRole = roleFilter ? emp.role === roleFilter : true;

    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Employee Management</h2>
          <p className="text-sm font-semibold text-slate-400 mt-0.5">Manage employee accounts, designations, and leave allocations</p>
        </div>
        <button
          onClick={() => setActiveModal('add')}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4.5 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-700 transition-all cursor-pointer focus:outline-hidden"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Employee
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Search bar */}
          <div>
            <label htmlFor="search" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Search Directory
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, designation..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-850 placeholder-slate-400 outline-hidden transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {/* Department filter */}
          <div>
            <label htmlFor="dept" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Department
            </label>
            <select
              id="dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">All Departments</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Security Role
            </label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex">
            <button
              onClick={() => {
                setSearchQuery('');
                setDeptFilter('');
                setRoleFilter('');
              }}
              disabled={!searchQuery && !deptFilter && !roleFilter}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-650 hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table Grid */}
      <Table
        headers={['Name / Details', 'Email', 'Role', 'Department', 'Designation', 'Actions']}
        isLoading={false}
        isEmpty={!isLoading && filteredEmployees.length === 0}
        emptyTitle="No employees found."
        emptyDescription="There are no directory profiles matching the current filter options."
      >
        {isLoading ? (
          <tr>
            <td colSpan={6} className="px-6 py-12">
              <div className="flex justify-center items-center">
                <Spinner size="lg" label="Loading employees..." />
              </div>
            </td>
          </tr>
        ) : (
          filteredEmployees.map((emp) => (
            <tr key={emp._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
              <td className="px-6 py-4.5">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(emp);
                    setActiveModal('profile');
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold select-none border border-slate-200">
                    {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 hover:text-brand-650 transition-colors">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{emp.designation}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4.5 text-slate-550 text-xs font-semibold">{emp.email}</td>
              <td className="px-6 py-4.5">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                  emp.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-150 text-slate-500'
                }`}>
                  {emp.role}
                </span>
              </td>
              <td className="px-6 py-4.5 text-slate-650 text-sm font-semibold">{emp.department}</td>
              <td className="px-6 py-4.5 text-slate-500 text-xs font-semibold">{emp.designation}</td>
              <td className="px-6 py-4.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-50 hover:text-slate-700 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    title="Edit profile information"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(emp);
                      setActiveModal('delete');
                    }}
                    className="rounded-lg p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Delete account profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* 1. Modal: View Profile */}
      <Modal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        title="Employee File Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-slate-150 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-700 font-bold text-base">
                {selectedUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-850">{selectedUser.name}</h4>
                <p className="text-xs text-slate-450 font-semibold uppercase">{selectedUser.designation} &bull; {selectedUser.department}</p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4.5 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Access Role</p>
                <p className="mt-1 font-semibold text-slate-800 capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Unit</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedUser.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <p className="mt-1 font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Directory
                </p>
              </div>
            </div>

            {/* Leave Balance breakdown */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time-Off Allotments</h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-extrabold text-brand-600 uppercase">Casual</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{selectedUser.leaveBalance?.casual ?? 10}d</p>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-extrabold text-amber-700 uppercase">Sick</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{selectedUser.leaveBalance?.sick ?? 8}d</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-extrabold text-emerald-700 uppercase">Earned</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{selectedUser.leaveBalance?.earned ?? 15}d</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Modal: Add Employee */}
      <Modal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        title="Add Employee Profile"
      >
        <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="addName" className="block text-xs font-bold text-slate-700">Full Name</label>
              <input
                id="addName"
                type="text"
                {...addForm.register('name')}
                placeholder="Full name"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
              />
              {addForm.formState.errors.name && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{addForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="addEmail" className="block text-xs font-bold text-slate-700">Email Address</label>
              <input
                id="addEmail"
                type="email"
                {...addForm.register('email')}
                placeholder="name@company.com"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
              />
              {addForm.formState.errors.email && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{addForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="addPassword" className="block text-xs font-bold text-slate-700">Account Password</label>
              <input
                id="addPassword"
                type="password"
                {...addForm.register('password')}
                placeholder="••••••"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
              />
              {addForm.formState.errors.password && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{addForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="addRole" className="block text-xs font-bold text-slate-700">Security Role</label>
              <select
                id="addRole"
                {...addForm.register('role')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-hidden focus:border-brand-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="addDept" className="block text-xs font-bold text-slate-700">Department Unit</label>
              <input
                id="addDept"
                type="text"
                {...addForm.register('department')}
                placeholder="e.g. IT, HR, Finance"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
              />
            </div>

            <div>
              <label htmlFor="addDesig" className="block text-xs font-bold text-slate-700">Designation Title</label>
              <input
                id="addDesig"
                type="text"
                {...addForm.register('designation')}
                placeholder="e.g. Senior Analyst"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 disabled:opacity-75"
            >
              {isSubmitting ? <Spinner size="sm" color="white" /> : 'Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Edit Employee (simulated CRUD) */}
      <Modal
        isOpen={activeModal === 'edit'}
        onClose={() => setActiveModal(null)}
        title="Edit Employee Information"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="editName" className="block text-xs font-bold text-slate-700">Full Name</label>
              <input
                id="editName"
                type="text"
                {...editForm.register('name')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="editEmail" className="block text-xs font-bold text-slate-700">Email Address</label>
              <input
                id="editEmail"
                type="email"
                {...editForm.register('email')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="editRole" className="block text-xs font-bold text-slate-700">Security Role</label>
              <select
                id="editRole"
                {...editForm.register('role')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-hidden"
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="editDept" className="block text-xs font-bold text-slate-700">Department</label>
              <input
                id="editDept"
                type="text"
                {...editForm.register('department')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="editDesig" className="block text-xs font-bold text-slate-700">Designation</label>
              <input
                id="editDesig"
                type="text"
                {...editForm.register('designation')}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Leave Balance Quotas */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Adjust Time-Off Quotas (Days)</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="editCasual" className="block text-[10px] font-bold text-slate-400 uppercase">Casual</label>
                  <input
                    id="editCasual"
                    type="number"
                    {...editForm.register('casual', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="editSick" className="block text-[10px] font-bold text-slate-400 uppercase">Sick</label>
                  <input
                    id="editSick"
                    type="number"
                    {...editForm.register('sick', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="editEarned" className="block text-[10px] font-bold text-slate-400 uppercase">Earned</label>
                  <input
                    id="editEarned"
                    type="number"
                    {...editForm.register('earned', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-75"
            >
              {isSubmitting ? <Spinner size="sm" color="white" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>


      {/* 5. Modal: Delete Profile */}
      <Modal
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        title="Confirm Profile Deletion"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete the profile file for <span className="font-bold text-slate-800">{selectedUser.name}</span>? This will restrict their access.
            </p>
            
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-75"
              >
                {isSubmitting ? <Spinner size="sm" color="white" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageEmployees;
