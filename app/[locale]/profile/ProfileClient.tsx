'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileClient({ user }: ProfileProps) {
  const t = useTranslations('Profile');
  const [activeTab, setActiveTab] = useState<'wishes' | 'pillars' | 'privacy'>('wishes');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; wishId: string | null }>({ open: false, wishId: null });

  useEffect(() => {
    if (activeTab === 'privacy') {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/${activeTab}?mine=true`);
        const result = await res.json();
        if (!result.error) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete ALL your wishes, pillar dedications, and personal records from the Temple of Light. This action cannot be undone.\n\nAre you sure you want to proceed?"
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        window.location.href = '/';
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Failed to delete data. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-atmosphere" />
      
      <div className="profile-container animate-fade-up">
        <header className="profile-header">
          <div className="profile-avatar-wrapper">
            {user.image ? (
              <Image src={user.image} alt={user.name || 'User'} width={80} height={80} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-fallback">{user.name?.[0] || 'U'}</div>
            )}
            <div className="profile-halo" />
          </div>
          <h1 className="profile-name text-gradient-gold-v2">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
        </header>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'wishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishes')}
          >
            {t('myWishes')}
          </button>
          <button 
            className={`profile-tab ${activeTab === 'pillars' ? 'active' : ''}`}
            onClick={() => setActiveTab('pillars')}
          >
            {t('myPillars')}
          </button>
          <button 
            className={`profile-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            {t('privacyData')}
          </button>
        </div>

        <section className="profile-content">
          {activeTab === 'privacy' ? (
            <div className="privacy-settings glass-card">
              <h2 className="settings-title">{t('dataPrivacy')}</h2>
              <p className="settings-desc">
                {t('privacyDesc')}
              </p>
              
              <div className="privacy-action-box">
                <div className="action-info">
                  <h3>{t('rightForgotten')}</h3>
                  <p>{t('rightForgottenDesc')}</p>
                </div>
                <button 
                  className="btn-delete-data" 
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                >
                  {isDeleting ? t('deleting') : t('deleteData')}
                </button>
              </div>

              <div className="privacy-action-box">
                <div className="action-info">
                  <h3>{t('dataPortability')}</h3>
                  <p>{t('dataPortabilityDesc')}</p>
                </div>
                <button className="btn-ghost-small" onClick={async () => {
                  try {
                    const res = await fetch('/api/user/export');
                    if (!res.ok) throw new Error('Export failed');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `my_sanctuary_data.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch {
                    alert(t('exportError') || 'Export failed. Please try again.');
                  }
                }}>
                  {t('requestExport')}
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="loading-state">{t('loading')}</div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              {activeTab === 'wishes' ? t('emptyWishes') : t('emptyPillars')}
            </div>
          ) : (
            <div className="items-grid">
              {data.map(item => (
                <article key={item.id} className="item-card glass-card">
                  <div className="item-date">{new Date(item.created_at).toLocaleDateString()}</div>
                  <p className="item-text">“{item.content || item.message}”</p>
                  <div className="item-footer">
                    {activeTab === 'wishes' && (
                      <span className="stat-likes">✨ {item.likes_count || 0} {t('lights')}</span>
                    )}
                    {activeTab === 'pillars' && (
                      <span className="stat-amount">💎 {item.amount} {t('soulPoints')}</span>
                    )}
                    <span className={`badge ${item.is_public ? 'public' : 'private'}`}>
                      {item.is_public ? t('public') : t('private')}
                    </span>
                    {activeTab === 'wishes' && (
                      <div className="item-actions">
                        <button
                          className="btn-item-action"
                          title={item.is_public ? t('makePrivate') || 'Make Private' : t('makePublic') || 'Make Public'}
                          onClick={async () => {
                            const res = await fetch('/api/wishes', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, action: 'toggle_public' }),
                            });
                            if (res.ok) {
                              setData(prev => prev.map(w => w.id === item.id ? { ...w, is_public: !w.is_public } : w));
                            }
                          }}
                        >{item.is_public ? '🔒' : '🌐'}</button>
                        <button
                          className="btn-item-action btn-item-delete"
                          title={t('deleteWish') || 'Delete'}
                          onClick={() => setConfirmModal({ open: true, wishId: item.id })}
                        >🗑️</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      {/* ── Custom Delete Confirm Modal ── */}
      {confirmModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setConfirmModal({ open: false, wishId: null })}>
          <div style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '20px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px', color: '#fff' }}>{t('deleteWish') || 'Delete Wish'}</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>{t('confirmDelete') || 'Delete this wish? This cannot be undone.'}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-ui)' }}
                onClick={() => setConfirmModal({ open: false, wishId: null })}>
                {t('makePrivate') ? 'Cancel' : 'Cancel'}
              </button>
              <button style={{ background: 'rgba(229,57,53,0.8)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}
                onClick={async () => {
                  const id = confirmModal.wishId;
                  setConfirmModal({ open: false, wishId: null });
                  if (!id) return;
                  const res = await fetch('/api/wishes', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                  });
                  if (res.ok) setData(prev => prev.filter(w => w.id !== id));
                }}>
                {t('deleteWish') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <style>{`
        .profile-page { min-height: 100vh; padding: calc(var(--nav-height) + 40px) 24px 80px; position: relative; background: #050505; color: #fff; font-family: var(--font-ui); }
        .profile-atmosphere { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(212, 160, 23, 0.1) 0%, transparent 60%); pointer-events: none; }
        
        .profile-container { max-width: 800px; margin: 0 auto; position: relative; z-index: 10; }
        
        .profile-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 50px; text-align: center; }
        .profile-avatar-wrapper { position: relative; width: 80px; height: 80px; margin-bottom: 20px; }
        .profile-avatar { border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-gold); position: relative; z-index: 2; }
        .profile-avatar-fallback { width: 100%; height: 100%; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary-gold); border: 2px solid var(--primary-gold); position: relative; z-index: 2; }
        .profile-halo { position: absolute; inset: -10px; border-radius: 50%; background: radial-gradient(circle, rgba(212, 160, 23, 0.3) 0%, transparent 70%); z-index: 1; animation: pulse-halo 4s infinite alternate; }
        
        .profile-name { font-family: var(--font-serif); font-size: 2.5rem; margin-bottom: 5px; }
        .profile-email { color: var(--text-tertiary); font-size: 0.9rem; }
        
        .profile-tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
        .profile-tab { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.1rem; padding: 10px 20px; cursor: pointer; transition: 0.3s; position: relative; font-family: var(--font-serif); }
        .profile-tab:hover { color: #fff; }
        .profile-tab.active { color: var(--primary-gold); }
        .profile-tab.active::after { content: ''; position: absolute; bottom: -21px; left: 0; width: 100%; height: 2px; background: var(--primary-gold); box-shadow: 0 0 10px var(--primary-gold); }
        
        .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        
        .item-card { padding: 24px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; }
        .item-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(212, 160, 23, 0.3); }
        
        .item-date { font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: 12px; }
        .item-text { font-size: 1.1rem; line-height: 1.6; color: #eee; font-style: italic; margin-bottom: 24px; flex-grow: 1; }
        
        .item-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
        .stat-likes, .stat-amount { font-size: 0.9rem; color: var(--primary-gold); font-weight: 600; }
        
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; }
        .badge.public { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
        .badge.private { background: rgba(255, 255, 255, 0.1); color: #aaa; }
        
        .item-actions { display: flex; gap: 8px; margin-left: auto; }
        .btn-item-action { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #aaa; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-item-action:hover { background: rgba(212,160,23,0.1); border-color: rgba(212,160,23,0.3); color: var(--primary-gold); }
        .btn-item-delete:hover { background: rgba(229,57,53,0.1); border-color: rgba(229,57,53,0.3); color: #E53E3E; }
        
        .empty-state, .loading-state { text-align: center; color: var(--text-tertiary); padding: 60px 0; font-style: italic; }
        
        /* Privacy Settings Styles */
        .privacy-settings { padding: 40px; }
        .settings-title { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 16px; color: var(--primary-gold); }
        .settings-desc { color: var(--text-secondary); margin-bottom: 40px; line-height: 1.6; font-size: 0.95rem; }
        
        .privacy-action-box { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; border-top: 1px solid rgba(255,255,255,0.05); gap: 16px; flex-wrap: wrap; }
        .action-info h3 { font-size: 1rem; margin-bottom: 8px; color: #fff; }
        .action-info p { font-size: 0.85rem; color: var(--text-tertiary); }
        
        .btn-delete-data { background: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c; color: #e74c3c; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: 600; white-space: nowrap; }
        .btn-delete-data:hover:not(:disabled) { background: #e74c3c; color: #fff; }
        .btn-delete-data:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-ghost-small { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.85rem; white-space: nowrap; }
        .btn-ghost-small:hover { background: rgba(255,255,255,0.1); }

        @keyframes pulse-halo {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0.8; }
        }

        @media (max-width: 600px) {
          .privacy-action-box { flex-direction: column; align-items: flex-start; }
          .btn-delete-data, .btn-ghost-small { width: 100%; text-align: center; }
          .privacy-settings { padding: 24px; }
          .items-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
