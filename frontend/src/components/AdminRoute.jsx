import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import { clearAdminSession, getAdminToken } from '../utils/adminAuth';

const AdminRoute = () => {
  const location = useLocation();
  const [status, setStatus] = useState(() => (
    getAdminToken() ? 'checking' : 'unauthenticated'
  ));

  useEffect(() => {
    if (status !== 'checking') {
      return;
    }

    let active = true;
    authAPI.getAdminSession()
      .then(() => {
        if (active) {
          setStatus('authenticated');
        }
      })
      .catch(() => {
        clearAdminSession();
        if (active) {
          setStatus('unauthenticated');
        }
      });

    return () => {
      active = false;
    };
  }, [status]);

  if (status === 'checking') {
    return (
      <div className="admin-loading-screen" aria-hidden="true" />
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
