import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getCategories(),
      apiService.getSubcategories()
    ])
      .then(([catRes, subRes]) => {
        setCategories(catRes.data || catRes);
        setSubcategories(subRes.data || subRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '3rem' }}>
          <h2>Our Collections</h2>
          <p>Explore our carefully curated categories.</p>
        </div>
        <div className="loading-screen" style={{ minHeight: '300px' }}><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-purple) 100%)', padding: '3rem 2rem', borderRadius: '16px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', position: 'relative', zIndex: 2 }}>Our Collections</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, position: 'relative', zIndex: 2 }}>Explore our carefully curated categories.</p>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h3>No collections yet</h3>
          <p>Check back soon for our curated collections.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {categories.map((cat, idx) => {
            const catKey = getCategoryKey(cat.name);
            const catSubs = subcategories.filter(s => s.category_id === cat.id);
            const defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
                  <ImageWithSkeleton src={cat.image_url || defaultImg} alt={cat.name} style={{ width: '85%', maxWidth: '400px', borderRadius: '50%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', aspectRatio: '1/1', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>Browse our {cat.name.toLowerCase()} collection.</p>
                  <button className="btn btn-teal" onClick={() => navigate(`/shop?category=${catKey}`)} style={{ marginBottom: '1.5rem' }}>
                    Shop {cat.name}
                  </button>
                  {catSubs.length > 0 && (
                    <>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-teal)' }}>Subcategories:</h4>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {catSubs.map(sub => (
                          <button key={sub.id} className="btn btn-outline-teal" onClick={() => navigate(`/shop?category=${catKey}`)} style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}>
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
