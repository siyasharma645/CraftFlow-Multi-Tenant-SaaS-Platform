import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['accepted','in_progress','review'].includes(o.status)).length,
    completed: orders.filter(o => ['approved','completed'].includes(o.status)).length,
  };

  const recent = orders.slice(0, 5);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h2>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h2>
        <p>{user?.role === 'artist' ? 'Here\'s an overview of your creative work' : 'Here\'s the status of your custom orders'}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:20}}>Recent Orders</h3>
          <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <div className="empty-title">No orders yet</div>
            <div className="empty-desc">
              {user?.role === 'customer' ? 'Place your first custom order to get started.' : 'Orders placed by customers will appear here.'}
            </div>
            {user?.role === 'customer' && <Link to="/orders/new" className="btn btn-primary">Place First Order</Link>}
          </div>
        ) : (
          <div className="orders-grid">
            {recent.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                <div className="order-card-icon">🎨</div>
                <div className="order-card-body">
                  <div className="order-card-title">{order.title}</div>
                  <div className="order-card-meta">
                    <span>{order.category}</span>
                    <span>₹{order.budget}</span>
                    {order.artist && <span>Artist: {order.artist.name}</span>}
                    {order.customer && user?.role === 'artist' && <span>By: {order.customer.name}</span>}
                  </div>
                  <div className="order-card-footer">
                    <StatusBadge status={order.status} />
                    <span style={{fontSize:12,color:'var(--ink-faint)'}}>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {user?.role === 'customer' && (
        <div style={{marginTop:20, textAlign:'center'}}>
          <Link to="/orders/new" className="btn btn-primary btn-lg">✦ Place New Order</Link>
        </div>
      )}
    </div>
  );
}
