import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Illustration', 'Logo Design', 'Painting', 'Digital Art', 'Embroidery', 'Jewelry', 'Pottery', 'Other'];

export default function NewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', budget: '', deadline: '', category: '',
    requirements: { dimensions: '', colorPreferences: '', style: '', additionalNotes: '' }
  });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleReq = (e) => setForm(f => ({ ...f, requirements: { ...f.requirements, [e.target.name]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.budget || !form.category) {
      setError('Please fill in all required fields'); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/orders', form);
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Place a Custom Order</h2>
        <p>Describe your project in detail to help artists understand your vision</p>
      </div>

      <div className="card card-lg" style={{maxWidth:720}}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="e.g., Custom watercolor portrait of my dog" />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handle}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget (₹) *</label>
              <input className="form-input" name="budget" type="number" value={form.budget} onChange={handle} placeholder="500" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="form-input" name="deadline" type="date" value={form.deadline} onChange={handle} />
          </div>
          <div className="form-group">
            <label className="form-label">Project Description *</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handle} placeholder="Describe what you want in detail. What is the project about? What should it convey?" rows={5} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Design Requirements</h3>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Dimensions / Size</label>
              <input className="form-input" name="dimensions" value={form.requirements.dimensions} onChange={handleReq} placeholder="e.g., A4, 1080x1080px" />
            </div>
            <div className="form-group">
              <label className="form-label">Style Preferences</label>
              <input className="form-input" name="style" value={form.requirements.style} onChange={handleReq} placeholder="e.g., Minimalist, Vintage, Realistic" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color Preferences</label>
            <input className="form-input" name="colorPreferences" value={form.requirements.colorPreferences} onChange={handleReq} placeholder="e.g., Warm tones, Blue palette, Black & white" />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-textarea" name="additionalNotes" value={form.requirements.additionalNotes} onChange={handleReq} placeholder="Any other details the artist should know…" rows={3} />
          </div>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Submitting…' : '✦ Submit Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
