import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { format } from 'date-fns';

function UploadDesignModal({ orderId, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!file) { setError('Please select a file'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || `Version ${Date.now()}`);
    fd.append('description', description);
    try {
      const res = await api.post(`/orders/${orderId}/designs`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Design Version</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Version Title</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Initial concept, Revised version" />
        </div>
        <div className="form-group">
          <label className="form-label">Notes for customer</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe changes or key decisions in this version…" rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">Design File *</label>
          <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
            {file ? (
              <div><div style={{fontSize:32}}>📎</div><p>{file.name}</p></div>
            ) : (
              <div><div style={{fontSize:32}}>⬆️</div><p>Click to select image or PDF (max 10MB)</p></div>
            )}
            <input id="file-input" type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Uploading…' : 'Upload Design'}</button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ design, onClose, onFeedback }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');

  const submit = async (status) => {
    setAction(status); setLoading(true);
    try {
      const res = await api.patch(`/orders/${design.order}/designs/${design._id}/feedback`, { status, comment });
      onFeedback(res.data, status);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Review Design v{design.versionNumber}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p style={{color:'var(--ink-light)',marginBottom:16,fontSize:14}}>{design.title}</p>
        <div className="form-group">
          <label className="form-label">Feedback / Comments</label>
          <textarea className="form-textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts on this design version…" rows={4} />
        </div>
        <div className="modal-footer" style={{justifyContent:'space-between'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-danger" onClick={() => submit('revision_requested')} disabled={loading}>
              {loading && action === 'revision_requested' ? '…' : '↩ Request Revision'}
            </button>
            <button className="btn btn-green" onClick={() => submit('approved')} disabled={loading}>
              {loading && action === 'approved' ? '…' : '✓ Approve Design'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [msgText, setMsgText] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isArtist = user?.role === 'artist';
  const isCustomer = user?.role === 'customer';
  const isOwn = order && (
    order.customer?._id === user?._id ||
    order.artist?._id === user?._id
  );

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${id}`),
      api.get(`/orders/${id}/designs`).catch(() => ({ data: [] })),
      api.get(`/orders/${id}/messages`).catch(() => ({ data: [] }))
    ]).then(([o, d, m]) => {
      setOrder(o.data); setDesigns(d.data); setMessages(m.data);
    }).catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    try {
      const res = await api.post(`/orders/${id}/messages`, { content: msgText });
      setMessages(m => [...m, res.data]);
      setMsgText('');
    } catch (err) { alert('Failed to send message'); }
  };

  const updateStatus = async (status) => {
    setStatusLoading(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrder(res.data);
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
    finally { setStatusLoading(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!order) return null;

  const latestDesign = designs.find(d => d.status === 'pending_review');
  const canUpload = isArtist && order.artist?._id === user?._id && ['accepted','in_progress','revision_requested'].includes(order.status);
  const canReview = isCustomer && order.customer?._id === user?._id && latestDesign;

  return (
    <div>
      <div className="order-detail-header">
        <div>
          <div style={{fontSize:12,color:'var(--ink-faint)',marginBottom:4}}>
            <span onClick={() => navigate('/orders')} style={{cursor:'pointer',textDecoration:'underline'}}>Orders</span> / {order.title}
          </div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:26}}>{order.title}</h2>
          <div style={{display:'flex',gap:10,marginTop:8,alignItems:'center',flexWrap:'wrap'}}>
            <StatusBadge status={order.status} />
            <span style={{fontSize:13,color:'var(--ink-light)'}}>📂 {order.category}</span>
            <span style={{fontSize:13,color:'var(--ink-light)'}}>💰 ₹{order.budget}</span>
            {order.deadline && <span style={{fontSize:13,color:'var(--ink-light)'}}>📅 {format(new Date(order.deadline), 'MMM d, yyyy')}</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {isArtist && order.status === 'pending' && !order.artist && (
            <button className="btn btn-teal" onClick={() => updateStatus('accepted')} disabled={statusLoading}>Accept Order</button>
          )}
          {isArtist && order.artist?._id === user?._id && order.status === 'accepted' && (
            <button className="btn btn-primary" onClick={() => updateStatus('in_progress')} disabled={statusLoading}>Start Work</button>
          )}
          {isArtist && order.artist?._id === user?._id && order.status === 'approved' && (
            <button className="btn btn-green" onClick={() => updateStatus('completed')} disabled={statusLoading}>Mark Complete</button>
          )}
          {canUpload && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>⬆ Upload Design</button>
          )}
          {canReview && (
            <button className="btn btn-teal" onClick={() => setShowFeedback(latestDesign)}>Review Design</button>
          )}
        </div>
      </div>

      <div className="tabs">
        {['overview','designs','messages'].map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' && '📋 '}{t === 'designs' && `🎨 Designs (${designs.length})`}
            {t === 'messages' && `💬 Messages (${messages.length})`}
            {t === 'overview' && 'Overview'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20}}>
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="detail-section">
                <h3>Project Description</h3>
                <p style={{fontSize:14,lineHeight:1.7,color:'var(--ink-light)'}}>{order.description}</p>
              </div>
              {(order.requirements?.dimensions || order.requirements?.style || order.requirements?.colorPreferences || order.requirements?.additionalNotes) && (
                <div className="detail-section">
                  <h3>Requirements</h3>
                  {order.requirements?.dimensions && <div className="detail-row"><span className="detail-label">Dimensions</span><span className="detail-value">{order.requirements.dimensions}</span></div>}
                  {order.requirements?.style && <div className="detail-row"><span className="detail-label">Style</span><span className="detail-value">{order.requirements.style}</span></div>}
                  {order.requirements?.colorPreferences && <div className="detail-row"><span className="detail-label">Colors</span><span className="detail-value">{order.requirements.colorPreferences}</span></div>}
                  {order.requirements?.additionalNotes && <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{order.requirements.additionalNotes}</span></div>}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="card">
              <div className="detail-section">
                <h3>Order Info</h3>
                <div className="detail-row"><span className="detail-label">Status</span><StatusBadge status={order.status} /></div>
                <div className="detail-row"><span className="detail-label">Customer</span><span className="detail-value">{order.customer?.name}</span></div>
                {order.artist && <div className="detail-row"><span className="detail-label">Artist</span><span className="detail-value">{order.artist.name}</span></div>}
                <div className="detail-row"><span className="detail-label">Budget</span><span className="detail-value">₹{order.budget}</span></div>
                {order.deadline && <div className="detail-row"><span className="detail-label">Deadline</span><span className="detail-value">{format(new Date(order.deadline), 'MMM d, yyyy')}</span></div>}
                <div className="detail-row"><span className="detail-label">Created</span><span className="detail-value">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span></div>
                <div className="detail-row"><span className="detail-label">Designs</span><span className="detail-value">{designs.length} version{designs.length !== 1 ? 's' : ''}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'designs' && (
        <div>
          {designs.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🖼️</div>
                <div className="empty-title">No designs yet</div>
                <div className="empty-desc">{isArtist ? 'Upload your first design version to get feedback.' : 'The artist hasn\'t uploaded any designs yet.'}</div>
                {canUpload && <button className="btn btn-primary" onClick={() => setShowUpload(true)}>Upload First Design</button>}
              </div>
            </div>
          ) : (
            <div className="version-timeline">
              {designs.map((d, i) => (
                <div key={d._id} className={`version-card ${d.status === 'pending_review' ? 'latest' : ''}`}>
                  <div className="version-card-header">
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span className="version-number">v{d.versionNumber}</span>
                      <strong style={{fontSize:15}}>{d.title}</strong>
                      {i === 0 && <span style={{fontSize:11,background:'var(--teal-light)',color:'var(--teal)',padding:'2px 8px',borderRadius:100,fontWeight:600}}>Latest</span>}
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.description && <p style={{fontSize:13,color:'var(--ink-light)',margin:'8px 0'}}>{d.description}</p>}
                  <div style={{fontSize:12,color:'var(--ink-faint)',marginBottom:8}}>
                    By {d.artist?.name} · {format(new Date(d.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{display:'inline-flex'}}>
                    📎 View {d.fileName}
                  </a>
                  {d.feedback?.comment && (
                    <div style={{marginTop:12,padding:'10px 14px',background:'var(--surface-raised)',borderRadius:'var(--radius)',borderLeft:'3px solid var(--accent)'}}>
                      <div style={{fontSize:11,color:'var(--ink-faint)',marginBottom:4}}>Customer feedback</div>
                      <p style={{fontSize:13}}>{d.feedback.comment}</p>
                    </div>
                  )}
                  {canReview && d.status === 'pending_review' && (
                    <div className="version-actions">
                      <button className="btn btn-teal btn-sm" onClick={() => setShowFeedback(d)}>Review This Version</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {canUpload && designs.length > 0 && (
            <div style={{marginTop:16}}>
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>⬆ Upload New Version</button>
            </div>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div>
          <div className="messages-container">
            <div className="messages-list">
              {messages.length === 0 && (
                <div style={{textAlign:'center',padding:'40px 0',color:'var(--ink-faint)',fontSize:14}}>
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map(msg => {
                const isOwn = msg.sender?._id === user?._id;
                return (
                  <div key={msg._id} className={`message-bubble${isOwn ? ' own' : ''}`}>
                    <div className="message-avatar">{msg.sender?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      {!isOwn && <div style={{fontSize:11,color:'var(--ink-faint)',marginBottom:3}}>{msg.sender?.name}</div>}
                      <div className="message-content">
                        <div className="message-text">{msg.content}</div>
                        <div className="message-time">{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-row">
              <input
                className="message-input"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <UploadDesignModal
          orderId={id}
          onClose={() => setShowUpload(false)}
          onUploaded={(d) => { setDesigns(prev => [d, ...prev]); setOrder(o => ({ ...o, status: 'review' })); }}
        />
      )}

      {showFeedback && (
        <FeedbackModal
          design={showFeedback}
          onClose={() => setShowFeedback(null)}
          onFeedback={(updated, status) => {
            setDesigns(prev => prev.map(d => d._id === updated._id ? updated : d));
            setOrder(o => ({ ...o, status: status === 'approved' ? 'approved' : 'revision_requested' }));
          }}
        />
      )}
    </div>
  );
}
