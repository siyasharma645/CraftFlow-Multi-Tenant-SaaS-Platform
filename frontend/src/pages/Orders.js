import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { format } from 'date-fns';

const CATEGORIES = ['All', 'Illustration', 'Logo Design', 'Painting', 'Digital Art', 'Embroidery', 'Jewelry', 'Pottery', 'Other'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchCat = filter === 'All' || o.category === filter;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
        <div>
          <h2>{user?.role === 'artist' ? 'All Orders' : 'My Orders'}</h2>
          <p>{user?.role === 'artist' ? 'Browse and accept custom order requests' : 'Track your custom order requests'}</p>
        </div>
        {user?.role === 'customer' && <Link to="/orders/new" className="btn btn-primary">✦ New Order</Link>}
      </div>

      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <input
          className="form-input"
          style={{maxWidth:280}}
          placeholder="Search orders…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No orders found</div>
            <div className="empty-desc">
              {user?.role === 'customer' ? 'You haven\'t placed any orders yet.' : 'No orders match your search.'}
            </div>
            {user?.role === 'customer' && <Link to="/orders/new" className="btn btn-primary">Place First Order</Link>}
          </div>
        </div>
      ) : (
        <div className="orders-grid">
          {filtered.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
              <div className="order-card-icon">🎨</div>
              <div className="order-card-body">
                <div className="order-card-title">{order.title}</div>
                <div className="order-card-meta">
                  <span>📂 {order.category}</span>
                  <span>💰 ₹{order.budget}</span>
                  {order.deadline && <span>📅 {format(new Date(order.deadline), 'MMM d')}</span>}
                  {user?.role === 'artist' && order.customer && <span>👤 {order.customer.name}</span>}
                  {user?.role === 'customer' && order.artist && <span>🎨 {order.artist.name}</span>}
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
  );
}
