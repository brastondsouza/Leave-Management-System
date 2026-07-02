import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-slate-50 px-4 text-center font-sans">
      <div className="space-y-6 max-w-md">
        {/* Visual Indicator */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-xs border border-brand-100 animate-pulse">
          <FileQuestion className="h-10 w-10" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-7xl font-extrabold text-slate-800 tracking-tighter">404</h2>
          <h3 className="text-xl font-bold text-slate-700">Page Not Found</h3>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-700 transition-all duration-150"
          >
            <Home className="h-4.5 w-4.5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
