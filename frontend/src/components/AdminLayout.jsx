import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ShieldUser } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearAdminSession, getAdminUsername } from '../utils/adminAuth';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminUsername = getAdminUsername() || 'admin';
  const showBackControl = location.pathname !== '/admin';

  const handleLogout = () => {
    clearAdminSession();
    toast.success('Admin session closed');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <span className="admin-brand-badge">
              <span className="admin-brand-emoji">🛒</span>
            </span>
            <div>
              <div className="admin-brand-title">Happy Grocery</div>
              <div className="admin-brand-subtitle">Admin Panel</div>
            </div>
          </div>

          <div className="admin-navbar-actions">
            {showBackControl ? (
              <button
                type="button"
                className="admin-back-btn admin-navbar-back-btn"
                onClick={() => navigate('/admin')}
                aria-label="Back"
              >
                <ArrowLeft size={16} />
                <span className="admin-control-text">Back</span>
              </button>
            ) : null}
            <span className="admin-user-chip" aria-label={adminUsername}>
              <ShieldUser size={16} />
              <span className="admin-control-text">{adminUsername}</span>
            </span>
            <button type="button" className="admin-logout-btn" onClick={handleLogout} aria-label="Log out">
              <LogOut size={16} />
              <span className="admin-control-text">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
