import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isArtist = user?.role === 'artist';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Craft<span>Flow</span></h1>
        <div className="sidebar-tagline">Order Management Platform</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">◈</span> Dashboard
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">◎</span> {isArtist ? 'All Orders' : 'My Orders'}
        </NavLink>
        {!isArtist && (
          <NavLink to="/orders/new" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">✦</span> New Order
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⎋</button>
        </div>
      )}
    </aside>
  );
}
