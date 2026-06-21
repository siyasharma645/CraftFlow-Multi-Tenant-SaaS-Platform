import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const selectRole = (role) => setForm(f => ({ ...f, role }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('Please select a role'); return; }
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Craft<span>Flow</span></h1>
          <p>Where creators meet customers</p>
        </div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join the platform</p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-cards">
          <div className={`role-card ${form.role === 'customer' ? 'selected' : ''}`} onClick={() => selectRole('customer')}>
            <div className="role-icon">🛍️</div>
            <div className="role-name">Customer</div>
            <div className="role-desc">Place custom orders</div>
          </div>
          <div className={`role-card ${form.role === 'artist' ? 'selected' : ''}`} onClick={() => selectRole('artist')}>
            <div className="role-icon">🎨</div>
            <div className="role-name">Artist</div>
            <div className="role-desc">Create & deliver designs</div>
          </div>
        </div>

        <div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" />
          </div>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
