import React, { useState } from 'react';
import { apiService } from '../../api';

export default function NewsletterPage({ adminToken, showToast }) {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState(['']); // Start with one empty url slot
  const [sending, setSending] = useState(false);

  const handleAddPhotoField = () => {
    setPhotos(prev => [...prev, '']);
  };

  const handlePhotoUrlChange = (idx, value) => {
    setPhotos(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleRemovePhotoField = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      showToast('Please enter a campaign title and content.');
      return;
    }

    if (!window.confirm('Are you sure you want to send this email campaign to all subscribers?')) {
      return;
    }

    setSending(true);
    try {
      const payload = {
        subject: subject || title,
        title,
        content,
        photos: photos.filter(Boolean) // Remove empty links
      };
      
      const res = await apiService.sendNewsletterCampaign(payload, adminToken);
      showToast(`Campaign sent successfully! Recipient Count: ${res.sentCount}`);
      
      // Reset form
      setSubject('');
      setTitle('');
      setContent('');
      setPhotos(['']);
    } catch (err) {
      console.error(err);
      showToast('Failed to send campaign: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }} className="newsletter-admin-grid">
      
      {/* Compose Form */}
      <div style={{ background: 'var(--glossy-bg)', border: '1px solid var(--glossy-border)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Compose Campaign
        </h3>
        
        <form onSubmit={handleSendCampaign}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem' }}>Email Subject Line</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Exclusive Insider Peek: New Summer Collection!" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem' }}>Newsletter Heading / Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. WhiskWear Kids Wear is Here!" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem' }}>Campaign Body Content</label>
            <textarea 
              className="form-control" 
              rows="8" 
              placeholder="Write your email body here. Double line breaks will translate into paragraphs in the email layout..." 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', margin: 0 }}>Campaign Photo URLs</label>
              <button 
                type="button" 
                onClick={handleAddPhotoField}
                style={{ background: 'none', border: 'none', color: 'var(--brand-teal)', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Add Photo Link
              </button>
            </div>
            {photos.map((url, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  value={url} 
                  onChange={e => handlePhotoUrlChange(idx, e.target.value)} 
                />
                {photos.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemovePhotoField(idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-cancelled)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={sending}
            style={{ width: '100%', background: 'var(--brand-purple)', borderColor: 'var(--brand-purple)', padding: '0.85rem', borderRadius: '30px', fontWeight: '700' }}
          >
            {sending ? 'Dispatching Campaign Emails...' : 'Send Campaign to Subscribers'}
          </button>
        </form>
      </div>

      {/* Live Template Preview Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
          Live Formal Layout Preview
        </h4>
        
        {/* Email Envelope Container */}
        <div style={{ background: '#f4f9f4', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            
            {/* Header */}
            <div style={{ background: '#1b4332', padding: '25px', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: '0px' }}>
                <img
                  src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png"
                  alt="WhiskWear Logo"
                  width="36"
                  height="36"
                  style={{ display: 'block', margin: '0 auto 6px' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  WHISK<span style={{ color: '#ffd166' }}>WEAR</span>
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', margin: '4px 0 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Kitchen Cloths &amp; Kids Wear
              </p>
            </div>
            
            {/* Content */}
            <div style={{ padding: '25px', minHeight: '180px' }}>
              <h2 style={{ fontSize: '18px', color: '#1b4332', margin: '0 0 10px', fontWeight: '700' }}>
                {title || 'Your Newsletter Heading'}
              </h2>
              {content ? (
                content.split(/\n\n+/).map((p, idx) => (
                  <p key={idx} style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', margin: '0 0 12px' }}>
                    {p.split('\n').map((line, lIdx) => <React.Fragment key={lIdx}>{line}<br/></React.Fragment>)}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                  Begin typing in the composer to preview the formal campaign body layout...
                </p>
              )}
              
              {/* Photo Previews */}
              {photos.filter(Boolean).map((url, idx) => (
                <div key={idx} style={{ margin: '15px 0', textAlign: 'center' }}>
                  <img 
                    src={url} 
                    alt={`Campaign visual ${idx + 1}`} 
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px', maxHeight: '160px', objectFit: 'contain', border: '1px solid #ddd' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div style={{ background: '#1b4332', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#ffd166', fontSize: '13px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '1.2px' }}>WHISKWEAR</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '0 0 10px' }}>Crafted with Care</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: 0 }}>
                  © {new Date().getFullYear()} WhiskWear. All rights reserved.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
