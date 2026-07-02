import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Shield, Mail, Briefcase } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Settings</h2>
        <p className="text-sm font-semibold text-slate-400 mt-0.5">View your account credentials and system configuration profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1">
          <Card className="border-slate-200 shadow-2xs text-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700 font-extrabold text-2xl border border-brand-100 shadow-xs mx-auto mb-4 select-none">
              {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <h3 className="text-lg font-black text-slate-855 tracking-tight">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{user?.designation}</p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-150 px-3 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                {user?.role}
              </span>
            </div>
          </Card>
        </div>

        {/* Detailed Profile Info Table */}
        <div className="md:col-span-2">
          <Card title="Account Metadata Details" className="border-slate-200 shadow-2xs h-full">
            <div className="divide-y divide-slate-100 text-sm font-medium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5">
                <span className="text-slate-400 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> Email Identity</span>
                <span className="text-slate-850 font-bold mt-1 sm:mt-0">{user?.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5">
                <span className="text-slate-400 flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /> Department Unit</span>
                <span className="text-slate-850 font-bold mt-1 sm:mt-0">{user?.department}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5">
                <span className="text-slate-400 flex items-center gap-2"><Shield className="h-4 w-4 text-slate-400" /> Assigned Designation</span>
                <span className="text-slate-850 font-bold mt-1 sm:mt-0">{user?.designation}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
