'use client';

import { useState, useEffect } from 'react';

type TabType = 'wishes' | 'pillars' | 'settings';

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabType>('pillars');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [persona, setPersona] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Upload State
  const [uploadData, setUploadData] = useState('');
  const [uploadType, setUploadType] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else {
      fetchData(activeTab);
    }
  }, [activeTab]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const pRes = await fetch('/api/settings?key=guru_persona');
      const pData = await pRes.json();
      setPersona(pData.value || '');

      const iRes = await fetch('/api/settings?key=guru_image_url');
      const iData = await iRes.json();
      setImageUrl(iData.value || '');
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadData.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/upload-scriptures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: uploadType, data: uploadData })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Successfully engraved ${result.count} new teachings.`);
        setUploadData('');
      } else {
        alert(result.error || 'Failed to upload');
      }
    } catch (err) {
      console.error(err);
      alert('Error during upload');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadData(content);
      // Auto-detect type based on extension
      if (file.name.endsWith('.json')) setUploadType('json');
      if (file.name.endsWith('.csv')) setUploadType('csv');
    };
    reader.readAsText(file);
  };

  const saveSetting = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const result = await res.json();
      if (result.success) {
        alert('Sacred knowledge updated successfully.');
      } else {
        alert(result.error || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving setting');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchData = async (tab: Exclude<TabType, 'settings'>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${tab}?admin=true`);
      const result = await res.json();
      if (!result.error) {
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (activeTab === 'settings') return;
    if (!confirm('Are you sure you want to delete this sacred record forever?')) return;
    
    try {
      const res = await fetch(`/api/${activeTab}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        setData(data.filter(item => item.id !== id));
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting record');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1 className="admin-title">사원 관리 시스템</h1>
        <p className="admin-subtitle">Temple Keepers' Domain</p>
        
        <div className="admin-tabs mt-12">
          <button 
            className={`admin-tab ${activeTab === 'pillars' ? 'active' : ''}`}
            onClick={() => setActiveTab('pillars')}
          >기둥 관리</button>
          <button 
            className={`admin-tab ${activeTab === 'wishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishes')}
          >소원 관리</button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >구루 설정</button>
        </div>
      </header>

      <div className="admin-content-container">
        {isLoading ? (
          <div className="loading">기록을 불러오는 중...</div>
        ) : activeTab === 'settings' ? (
          <div className="settings-container">
            {/* Persona Section */}
            <div className="admin-card">
              <div className="card-header">
                <h2 className="card-title">AI 페르소나 설정</h2>
                <p className="card-desc">구루의 성격, 말투, 사고 방식을 정의합니다.</p>
              </div>
              <div className="form-section">
                <label className="label-premium">구루의 성격 정의 (Persona Override)</label>
                <textarea 
                  className="admin-textarea"
                  placeholder="구루가 어떻게 행동하고 말해야 하는지 상세히 적어주세요..."
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                />
                <div className="admin-btn-wrap">
                  <button className="btn-premium" onClick={() => saveSetting('guru_persona', persona)} disabled={isSaving}>
                    {isSaving ? '저장 중...' : '페르소나 저장'}
                  </button>
                </div>
              </div>
            </div>

            {/* Visage Section */}
            <div className="admin-card">
              <div className="card-header">
                <h2 className="card-title">구루의 형상 설정</h2>
                <p className="card-desc">구루의 프로필 이미지를 설정합니다.</p>
              </div>
              <div className="form-section">
                <label className="label-premium">이미지 URL (Visage URL)</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <div className="mt-8 p-6 bg-black/20 rounded-3xl border border-white/5 inline-flex flex-col items-center">
                    <p className="text-[10px] text-[#555] mb-4 uppercase font-bold tracking-widest">미리보기</p>
                    <img src={imageUrl} alt="Guru Preview" className="w-32 h-32 rounded-full border-4 border-[#d4a017] shadow-2xl" />
                  </div>
                )}
                <div className="admin-btn-wrap">
                  <button className="btn-premium" onClick={() => saveSetting('guru_image_url', imageUrl)} disabled={isSaving}>
                    {isSaving ? '저장 중...' : '이미지 저장'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Upload Section */}
            <div className="admin-card">
              <div className="card-header">
                <h2 className="card-title">대량 경전 업로드</h2>
                <p className="card-desc">CSV 또는 JSON 파일을 통해 도서관을 확장합니다.</p>
              </div>
              
              <div className="upload-guidelines">
                <h4 className="label-premium text-[#d4a017] mb-6">업로드 가이드라인</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <p className="text-white text-xs font-bold mb-6">CSV 템플릿:</p>
                    <div className="template-box">
                      source,content,title<br/>
                      법구경,마음이 모든 것의...,진리
                    </div>
                  </div>
                  <div className="admin-template-gap">
                    <p className="text-white text-xs font-bold mb-6">JSON 템플릿:</p>
                    <div className="template-box">
                      [{"{"} "source": "...", "content": "..." {"}"}]
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 admin-dropdown-wrap">
                  <label className="label-premium">데이터 미리보기 / 직접 입력</label>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-[#555] font-bold uppercase tracking-widest">모드 선택:</span>
                    <select 
                      className="modern-select"
                      value={uploadType} 
                      onChange={(e) => setUploadType(e.target.value as any)}
                    >
                      <option value="json">JSON 모드</option>
                      <option value="csv">CSV 모드</option>
                    </select>
                  </div>
                </div>
                <textarea 
                  className="admin-textarea h-80"
                  placeholder="여기에 직접 붙여넣거나 파일을 업로드하세요..."
                  value={uploadData}
                  onChange={(e) => setUploadData(e.target.value)}
                />
                
                {/* Action Buttons Standardized Rhythm */}
                <div className="upload-actions-grid admin-btn-wrap">
                  <div className="upload-action-item">
                    <p className="upload-action-label">방법 1: 파일 업로드</p>
                    <label className="btn-premium file-upload-btn">
                      <span className="text-xl">📁</span> CSV/JSON 파일 선택
                      <input type="file" style={{ display: 'none' }} accept=".csv,.json" onChange={handleFileChange} />
                    </label>
                  </div>
                  
                  <div className="upload-action-item">
                    <p className="upload-action-label">방법 2: 직접 입력 후 전송</p>
                    <button 
                      className="btn-premium bg-[#d4a017] text-black hover:bg-white" 
                      onClick={handleBulkUpload} 
                      disabled={isSaving || !uploadData.trim()}
                    >
                      {isSaving ? '전송 중...' : '데이터 최종 전송'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-card p-0 overflow-hidden">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>이름/이메일</th>
                    <th>내용/메시지</th>
                    <th>금액</th>
                    <th>공개 여부</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="font-bold text-white">{item.name || item.user_name}</div>
                        <div className="text-[10px] opacity-40 uppercase tracking-tighter">{item.user_email || 'Anonymous'}</div>
                      </td>
                      <td className="max-w-xs">
                        <div className="truncate opacity-80">{item.message || item.content}</div>
                      </td>
                      <td className="font-mono text-[#d4a017]">{item.amount?.toLocaleString() || 0}</td>
                      <td>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${item.is_public ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                          {item.is_public ? '● Public' : '○ Private'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-delete-premium" onClick={() => handleDelete(item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && (
                <div className="py-40 text-center opacity-20 font-serif text-xl italic">기록이 비어있습니다.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard { min-height: 100vh; background: #050505; color: #fff; padding: 160px 40px; font-family: var(--font-sans); }
        .admin-header { max-width: 1200px; margin: 0 auto 80px; text-align: center; position: relative; z-index: 10; }
        .admin-title { font-family: var(--font-serif); color: var(--primary-gold); font-size: 4.5rem; margin-bottom: 20px; letter-spacing: -0.03em; text-shadow: 0 10px 30px rgba(212, 160, 23, 0.2); }
        .admin-subtitle { color: #444; text-transform: uppercase; letter-spacing: 0.5em; font-size: 0.8rem; font-weight: 900; }
        
        .admin-tabs { display: inline-flex; gap: 10px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.05); margin-top: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .admin-tab { padding: 16px 40px; border: none; background: transparent; color: #555; border-radius: 100px; cursor: pointer; transition: 0.5s var(--ease-expo); font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .admin-tab:hover { color: #888; background: rgba(255,255,255,0.02); }
        .admin-tab.active { background: var(--primary-gold); color: #000; box-shadow: 0 10px 30px rgba(212, 160, 23, 0.4); transform: scale(1.05); }
        
        .admin-content-container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 60px; position: relative; z-index: 5; }
        .admin-card { background: linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9)); border: 1px solid rgba(255,255,255,0.05); padding: 70px; border-radius: 50px; backdrop-filter: blur(30px); box-shadow: 0 40px 100px rgba(0,0,0,0.8); }
        .card-header { margin-bottom: 50px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 40px; }
        .card-title { font-family: var(--font-serif); font-size: 2.5rem; color: var(--primary-gold); margin-bottom: 15px; letter-spacing: -0.01em; }
        .card-desc { color: #555; font-size: 1rem; line-height: 1.6; }
        
        .form-section { margin-bottom: 80px; }
        .label-premium { display: block; text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.75rem; color: #888; margin-bottom: 25px !important; font-weight: 900; }
        
        .admin-textarea { width: 100%; height: 350px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 40px; color: #fff; outline: none; font-size: 1.1rem; resize: vertical; line-height: 1.8; transition: 0.4s; margin-bottom: 30px; }
        .admin-textarea:focus { border-color: var(--primary-gold); background: rgba(0,0,0,0.8); box-shadow: 0 0 50px rgba(212, 160, 23, 0.1); }
        
        .admin-btn-wrap { width: 100%; display: flex; justify-content: center; margin-top: 35px; margin-bottom: 20px; }
        .admin-template-gap { margin-top: 35px; }
        .admin-dropdown-wrap { margin-bottom: 40px; }

        @media (max-width: 768px) {
          .admin-btn-wrap { margin-top: 20px; }
          .admin-template-gap { margin-top: 20px; }
          .admin-dropdown-wrap { margin-bottom: 20px; }
          .admin-dashboard { padding: 80px 20px; }
          .admin-title { font-size: 2.5rem; }
          .admin-card { padding: 40px 25px; }
        }
        
        .upload-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: flex-start; }
        .upload-action-item { display: flex; flex-direction: column; align-items: center; gap: 30px; text-align: center; }
        .upload-action-label { color: #555; text-[10px] uppercase font-bold tracking-[0.3em] mb-4; }
        .file-upload-btn { display: flex; align-items: center; justify-center; gap: 12px; cursor: pointer; width: 340px !important; min-width: 340px !important; }
        .upload-action-item .btn-premium { width: 340px !important; min-width: 340px !important; display: flex; align-items: center; justify-content: center; }

        .admin-input { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 24px 36px; color: #fff; outline: none; font-size: 1.1rem; transition: 0.4s; }
        .admin-input:focus { border-color: var(--primary-gold); background: rgba(0,0,0,0.8); }

        .btn-premium { background: var(--primary-gold); color: #000; padding: 12px 32px; border-radius: 100px; font-weight: 950; cursor: pointer; border: none; transition: 0.5s var(--ease-expo); text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.85rem; box-shadow: 0 10px 20px rgba(212, 160, 23, 0.2); }
        .btn-premium:hover:not(:disabled) { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(212, 160, 23, 0.4); background: #f1c40f; }
        .btn-premium:disabled { opacity: 0.2; cursor: not-allowed; }

        .upload-guidelines { background: rgba(212, 160, 23, 0.02); border: 1px solid rgba(212, 160, 23, 0.08); padding: 50px; border-radius: 35px; margin: 50px 0; }
        .template-box { background: rgba(0,0,0,0.7); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); font-family: 'Fira Code', monospace; font-size: 0.9rem; color: #777; margin-top: 15px; line-height: 1.6; }

        .data-table-wrapper { background: transparent; border-radius: 0; padding: 0; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0 15px; }
        .data-table th { text-align: left; padding: 20px 30px; color: #444; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; font-weight: 900; }
        .data-table td { padding: 35px 30px; background: rgba(255,255,255,0.015); color: #888; font-size: 1rem; border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); }
        .data-table td:first-child { border-left: 1px solid rgba(255,255,255,0.03); border-radius: 24px 0 0 24px; }
        .data-table td:last-child { border-right: 1px solid rgba(255,255,255,0.03); border-radius: 0 24px 24px 0; }
        .data-table tr:hover td { background: rgba(212, 160, 23, 0.02); color: #fff; border-color: rgba(212, 160, 23, 0.1); }

        .btn-delete-premium { color: #ff4757; background: transparent; border: 1px solid rgba(255,71,87,0.2); padding: 10px 20px; border-radius: 10px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; cursor: pointer; transition: 0.3s; }
        .btn-delete-premium:hover { background: #ff4757; color: #fff; box-shadow: 0 0 20px rgba(255,71,87,0.3); }

        .modern-select { 
          background: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; 
          color: var(--primary-gold); padding: 12px 45px 12px 25px; font-weight: 900; 
          text-transform: uppercase; letter-spacing: 0.15em; outline: none; cursor: pointer; 
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23d4a017' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 20px center;
          transition: 0.3s;
          font-size: 0.75rem;
        }
        .modern-select:hover { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.1); }
        .modern-select option { background: #0a0a0a; color: #fff; padding: 20px; }

        .loading { display: flex; align-items: center; justify-content: center; height: 400px; color: var(--primary-gold); font-family: var(--font-serif); font-size: 2rem; opacity: 0.4; letter-spacing: 0.2em; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
      `}</style>
    </div>
  );
}
