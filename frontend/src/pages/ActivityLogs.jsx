import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { activityLogAPI } from '../api/activityLog';
import { PageLoader } from '../components/LoadingSpinner';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          activityLogAPI.getLogs(),
          activityLogAPI.getStats(),
        ]);
        setLogs(logsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const getActivityIcon = (type) => {
    const icons = {
      'login': '🔐',
      'logout': '🚪',
      'register': '📝',
      'profile_update': '✏️',
      'password_change': '🔑',
      'password_reset': '🔄',
      'order_placed': '🛒',
      'order_cancelled': '❌',
      'order_delivered': '✅',
      'cart_add': '➕',
      'cart_remove': '➖',
      'wishlist_add': '❤️',
      'wishlist_remove': '💔',
      'coupon_apply': '🏷️',
      'coupon_remove': '🏷️',
      'profile_view': '👤',
      'settings_update': '⚙️',
      'search': '🔍',
      'product_view': '👁️',
      'category_view': '📂',
      'checkout': '💳',
      'payment': '💰',
      'address_add': '📍',
      'address_update': '📍',
      'address_delete': '🗑️',
      'contact_submit': '📧',
      'email_verification': '📧',
      'phone_verification': '📱',
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    const colors = {
      'login': '#4caf50',
      'logout': '#ff9800',
      'register': '#2196f3',
      'order_placed': '#9c27b0',
      'order_delivered': '#4caf50',
      'order_cancelled': '#f44336',
      'cart_add': '#4caf50',
      'cart_remove': '#f44336',
      'wishlist_add': '#e91e63',
      'wishlist_remove': '#9e9e9e',
      'payment': '#ff9800',
      'checkout': '#9c27b0',
    };
    return colors[type] || '#666';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.activity_type === filter);

  const activityTypes = [...new Set(logs.map(log => log.activity_type))];

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>🔒 Please Login to View Activity Logs</h2>
        <p>You need to be logged in to view your activity history.</p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <PageLoader />;

  return (
    <div className="container">
      <h1 className="section-title">📊 My Activity Log</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="activity-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.today_activities}</h3>
              <p>Today's Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📆</div>
            <div className="stat-info">
              <h3>{stats.week_activities}</h3>
              <p>This Week</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{logs.length}</h3>
              <p>Total Activities</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="activity-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {activityTypes.slice(0, 5).map(type => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {getActivityIcon(type)} {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="activity-timeline">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <div key={log.id || index} className="activity-item">
              <div 
                className="activity-icon"
                style={{ backgroundColor: getActivityColor(log.activity_type) }}
              >
                {getActivityIcon(log.activity_type)}
              </div>
              <div className="activity-content">
                <h4>{log.activity_display || log.activity_type.replace(/_/g, ' ')}</h4>
                <p>{log.description || 'No description'}</p>
                <span className="activity-time">
                  🕒 {formatDate(log.created_at)}
                </span>
                {log.ip_address && (
                  <span className="activity-ip">🌐 {log.ip_address}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Activity Yet</h3>
            <p>Start exploring to see your activity here!</p>
            <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
