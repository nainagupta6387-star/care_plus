import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { getAuthToken } from '../../api';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = getAuthToken();
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;

  // 1. Unauthenticated check
  if (!token || !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // 2. Role Authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              403 Access Forbidden
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-3">Unauthorized Role Access</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your account role (<strong className="text-slate-800 uppercase">{user.role}</strong>) does not have authorization to view this protected dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <a
              href="/login"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In with Different Account</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
