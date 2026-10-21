'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import './admin.css';

type Scan = {
  id: string;
  created_at: string;
  referral_code: string;
  event_type: string;
};

type Stats = {
  totalScans: number;
  todayScans: number;
  subscribedUsers: number;
  channelMembers: number | null;
  channelStatsError: string | null;
  dailyScans: { date: string; scans: number }[];
  latestScans: Scan[];
  dataWarnings?: string[];
};

export default function AdminDashboard({ loggedIn }: { loggedIn: boolean }) {
  const [authed, setAuthed] = useState(loggedIn);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/stats', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Ma’lumotlarni yuklab bo‘lmadi.');
      setStats(d);
      setLastRefreshed(new Date().toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ma’lumotlarni olishda xatolik.');
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    void load();
    if (!authed) return;
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, [load, authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoginLoading(true);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || 'Kirish amalga oshmadi.');
        return;
      }
      setAuthed(true);
      setPassword('');
      window.location.reload();
    } catch {
      setError('Tizimga ulanishda xatolik.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setStats(null);
  }

  const copyLandingLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  // Calculations for charts and metrics
  const maxDailyScans = useMemo(() => {
    if (!stats?.dailyScans?.length) return 1;
    return Math.max(...stats.dailyScans.map((d) => d.scans), 1);
  }, [stats?.dailyScans]);

  const total7Days = useMemo(() => {
    if (!stats?.dailyScans?.length) return 0;
    return stats.dailyScans.reduce((acc, curr) => acc + curr.scans, 0);
  }, [stats?.dailyScans]);

  const conversionRate = useMemo(() => {
    if (!stats?.totalScans || stats.totalScans === 0) return 0;
    return Math.round((stats.subscribedUsers / stats.totalScans) * 100);
  }, [stats?.totalScans, stats?.subscribedUsers]);

  // Filtered scans
  const filteredScans = useMemo(() => {
    if (!stats?.latestScans) return [];
    return stats.latestScans.filter((s) => {
      const matchSearch =
        s.referral_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.event_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = selectedFilter === 'all' || s.event_type === selectedFilter;
      return matchSearch && matchFilter;
    });
  }, [stats?.latestScans, searchQuery, selectedFilter]);

  // LOGIN SCREEN
  if (!authed) {
    return (
      <main className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel login-card" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(230,189,98,0.2) 0%, rgba(56,189,248,0.2) 100%)',
                border: '1px solid rgba(230,189,98,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                boxShadow: '0 0 24px rgba(230,189,98,0.25)',
                marginBottom: 12,
              }}
            >
              🎓
            </div>
            <p style={{ color: '#e6bd62', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>
              Sharofov School
            </p>
            <h1 style={{ margin: '6px 0 0 0', fontSize: 26, fontWeight: 800 }}>Admin Boshqaruv</h1>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Tizimga kirish uchun login va parolni kiriting</p>
          </div>

          <form onSubmit={login} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Admin Login
              </label>
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Login kiriting..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(11, 18, 33, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Maxfiy Parol
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(11, 18, 33, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: 13,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-modern btn-modern-primary"
              style={{ padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loginLoading ? 'Kirilmoqda...' : 'Tizimga kirish ➔'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 24, marginBottom: 0 }}>
            Xavfsiz admin boshqaruv tizimi
          </p>
        </div>
      </main>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="admin-wrapper">
      <div style={{ width: 'min(100% - 32px, 1140px)', margin: '0 auto', display: 'grid', gap: 24 }}>
        
        {/* TOP HEADER */}
        <header
          className="glass-panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(230,189,98,0.2) 0%, rgba(56,189,248,0.2) 100%)',
                border: '1px solid rgba(230,189,98,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#e6bd62', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Sharofov School
                </span>
                <span className="badge badge-green">
                  <span className="live-dot" /> Jonli Kuzatuv
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800 }}>Admin Dashboard</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a
              href="https://t.me/sharofovschool"
              target="_blank"
              rel="noreferrer"
              className="btn-modern btn-modern-secondary"
              title="Telegram kanalni ochish"
            >
              ✈️ Kanal: @sharofovschool
            </a>

            <button
              onClick={() => void load()}
              className="btn-modern btn-modern-secondary"
              disabled={loading}
              title="Ma’lumotlarni yangilash"
            >
              <span className={loading ? 'spinning' : ''} style={{ display: 'inline-block' }}>
                🔄
              </span>
              <span>{loading ? 'Yangilanmoqda…' : 'Yangilash'}</span>
            </button>

            <button onClick={logout} className="btn-modern btn-modern-danger" title="Tizimdan chiqish">
              Chiqish
            </button>
          </div>
        </header>

        {/* QUICK LINK & STATUS BANNER */}
        <div className="quick-action-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🔗
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Umumiy QR Kod / Asosiy Havola</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Foydalanuvchilar kiradigan asosiy havola (avtomatik <code>/r/main</code> ga yo‘naltiradi)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={copyLandingLink} className="btn-modern btn-modern-primary" style={{ padding: '8px 14px' }}>
              {copied ? '✓ Nusxalandi!' : '📋 Havolani nusxalash'}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn-modern btn-modern-secondary"
              style={{ padding: '8px 14px' }}
            >
              ↗ Saytni ochish
            </a>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* STATS 4 CARDS */}
        <section className="stats-grid">
          {/* Card 1: Total Scans */}
          <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #38bdf8, #2563eb)' } as React.CSSProperties}>
            <div>
              <div className="stat-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Jami Skanerlar</span>
                <div
                  className="stat-icon-wrapper"
                  style={{
                    '--icon-bg': 'rgba(56, 189, 248, 0.12)',
                    '--icon-color': '#38bdf8',
                    '--icon-border': 'rgba(56, 189, 248, 0.25)',
                  } as React.CSSProperties}
                >
                  📱
                </div>
              </div>
              <div className="stat-value">{stats?.totalScans?.toLocaleString() ?? '—'}</div>
            </div>
            <div className="stat-subtext">
              <span className="badge badge-blue">Hammasi</span>
              <span>Sayt sahifasi ochilishlari</span>
            </div>
          </div>

          {/* Card 2: Today Scans */}
          <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #fbbf24, #f59e0b)' } as React.CSSProperties}>
            <div>
              <div className="stat-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Bugungi Skanerlar</span>
                <div
                  className="stat-icon-wrapper"
                  style={{
                    '--icon-bg': 'rgba(245, 158, 11, 0.15)',
                    '--icon-color': '#fbbf24',
                    '--icon-border': 'rgba(245, 158, 11, 0.3)',
                  } as React.CSSProperties}
                >
                  ⚡
                </div>
              </div>
              <div className="stat-value">{stats?.todayScans?.toLocaleString() ?? '—'}</div>
            </div>
            <div className="stat-subtext">
              <span className="badge badge-gold">Bugun</span>
              <span>Toshkent vaqti bo‘yicha</span>
            </div>
          </div>

          {/* Card 3: Subscribed Users */}
          <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #34d399, #059669)' } as React.CSSProperties}>
            <div>
              <div className="stat-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Tasdiqlangan Obunachilar</span>
                <div
                  className="stat-icon-wrapper"
                  style={{
                    '--icon-bg': 'rgba(16, 185, 129, 0.15)',
                    '--icon-color': '#34d399',
                    '--icon-border': 'rgba(16, 185, 129, 0.3)',
                  } as React.CSSProperties}
                >
                  ✅
                </div>
              </div>
              <div className="stat-value">{stats?.subscribedUsers?.toLocaleString() ?? '—'}</div>
            </div>
            <div className="stat-subtext">
              <span className="badge badge-green">{conversionRate}% konversiya</span>
              <span>Kanalga a'zo bo‘lganlar</span>
            </div>
          </div>

          {/* Card 4: Channel Members */}
          <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #c084fc, #7c3aed)' } as React.CSSProperties}>
            <div>
              <div className="stat-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Kanal A’zolari</span>
                <div
                  className="stat-icon-wrapper"
                  style={{
                    '--icon-bg': 'rgba(168, 85, 247, 0.15)',
                    '--icon-color': '#c084fc',
                    '--icon-border': 'rgba(168, 85, 247, 0.3)',
                  } as React.CSSProperties}
                >
                  👥
                </div>
              </div>
              <div className="stat-value">
                {stats?.channelMembers !== null && stats?.channelMembers !== undefined
                  ? stats.channelMembers.toLocaleString()
                  : '—'}
              </div>
            </div>
            <div className="stat-subtext">
              <span className="badge badge-purple">Telegram</span>
              <span>@sharofovschool a’zolari</span>
            </div>
          </div>
        </section>

        {/* 7-DAYS INTERACTIVE CHART */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>So‘nggi 7 Kunlik Faollik Grafigi</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
                Har kungi QR skanerlar va ochilishlar dinamikasi
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                7 kunlik jami: <strong style={{ color: '#fff' }}>{total7Days} ta</strong>
              </div>
              <span className="badge badge-blue">Kunlik o‘rtacha: {Math.round(total7Days / 7)} ta</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="chart-container">
            {stats?.dailyScans?.map((d) => {
              const heightPercent = Math.max(Math.round((d.scans / maxDailyScans) * 100), 4);
              const isPeak = d.scans === maxDailyScans && d.scans > 0;
              // Format date nicely: "2026-10-21" -> "21-Okt"
              const parts = d.date.split('-');
              const shortDate = parts.length === 3 ? `${parts[2]}.${parts[1]}` : d.date;

              return (
                <div key={d.date} className="chart-bar-col">
                  <div className="chart-bar-wrapper">
                    <div className="chart-tooltip">
                      {d.date}: {d.scans} ta tashrif {isPeak ? '🏆' : ''}
                    </div>
                    <div
                      className={`chart-bar ${isPeak ? 'peak' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="chart-label" style={{ color: isPeak ? '#fbbf24' : '#94a3b8', fontWeight: isPeak ? 700 : 500 }}>
                    {shortDate}
                  </div>
                </div>
              );
            })}
          </div>

          {stats?.channelStatsError && (
            <p style={{ fontSize: 12, color: '#fbbf24', marginTop: 14, marginBottom: 0 }}>
              ℹ️ Kanal a’zolarini olishda bildirishnoma: {stats.channelStatsError}
            </p>
          )}
        </section>

        {/* RECENT SCANS TABLE WITH SEARCH & FILTER */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Oxirgi Tashriflar va Skanerlar</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
                Real vaqt rejimida yozib borilayotgan voqealar ro‘yxati
              </p>
            </div>

            {/* Search Input */}
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Kod yoki hodisani qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: 230 }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="custom-scroll" style={{ overflowX: 'auto', borderRadius: 12 }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Sana va Vaqt</th>
                  <th>Referal Kodi</th>
                  <th>Hodisa Turi</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.length > 0 ? (
                  filteredScans.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFeatureSettings: '"tnum"' }}>
                        {new Date(s.created_at).toLocaleString('uz-UZ', {
                          timeZone: 'Asia/Tashkent',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontFamily: 'monospace' }}>
                          {s.referral_code}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {s.event_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#34d399', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Qayd etildi
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                      {searchQuery ? 'Qidiruvga mos tashriflar topilmadi.' : 'Hozircha hech qanday skaner qayd etilmagan.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 16,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <div>
              Avtomatik yangilanish: har <strong>15 soniyada</strong>. Oxirgi yangilanish: <strong>{lastRefreshed || '—'}</strong>
            </div>
            <div>Barcha hisobotlar Toshkent vaqti (Asia/Tashkent) bo‘yicha ko‘rsatiladi.</div>
          </div>
        </section>

        {/* SYSTEM STATUS FOOTER */}
        <section
          className="glass-panel"
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: 13,
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span>
              Ma’lumotlar bazasi: <strong style={{ color: '#34d399' }}>● Supabase PostgreSQL</strong>
            </span>
            <span>
              Telegram Bot: <strong style={{ color: '#38bdf8' }}>● @sharofov_school_bot</strong>
            </span>
            <span>
              Kanal: <strong style={{ color: '#c084fc' }}>● @sharofovschool</strong>
            </span>
          </div>
          <div style={{ color: '#64748b' }}>
            Sharofov School QR Referal v1.0
          </div>
        </section>

      </div>
    </div>
  );
}
