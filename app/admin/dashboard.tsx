'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import './admin.css';

type Scan = {
  id: string;
  created_at: string;
  referral_code: string;
  event_type: string;
  user_agent?: string;
};

type Stats = {
  scans: {
    total: number;
    today: number;
    month: number;
    year: number;
  };
  channel: {
    totalMembers: number | null;
    error: string | null;
    clicksTotal: number;
    clicksToday: number;
    clicksMonth: number;
    subscribedTotal: number;
    subscribedToday: number;
    subscribedMonth: number;
    conversionRate: number;
  };
  leads: {
    total: number;
    today: number;
    month: number;
    verifiedPayments: number;
    paidRewards: number;
    totalRewardAmount: number;
    pendingRewardAmount: number;
  };
  charts: {
    hourly: { hour: string; label: string; scans: number; joins: number }[];
    daily: { date: string; label: string; scans: number; joins: number; leads: number }[];
    monthly: { month: number; label: string; scans: number; joins: number; leads: number }[];
  };
  latestScans: Scan[];
};

export default function AdminDashboard({ loggedIn }: { loggedIn: boolean }) {
  const [authed, setAuthed] = useState(loggedIn);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter Period: daily (today), weekly (7 days), monthly (30 days), yearly (12 months)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // Stats data
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Fetch Dashboard Stats
  const loadStats = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/stats', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Statistikani yuklab bo‘lmadi.');
      setStats(d);
      setLastRefreshed(new Date().toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ma’lumotlarni olishda xatolik.');
    } finally {
      setLoading(false);
    }
  }, [authed]);

  // Initial load & Polling
  useEffect(() => {
    void loadStats();
    if (!authed) return;
    const interval = window.setInterval(() => {
      void loadStats();
    }, 12000);
    return () => window.clearInterval(interval);
  }, [loadStats, authed]);

  // Login handler
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
      setError('Tizimga ulanishda xatolik yuz berdi.');
    } finally {
      setLoginLoading(false);
    }
  }

  // Logout handler
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setStats(null);
  }


  // Active chart series according to selected period
  const chartData = useMemo(() => {
    if (!stats?.charts) return [];
    if (period === 'daily') {
      return stats.charts.hourly.map((h) => ({
        label: h.label,
        scans: h.scans,
        joins: h.joins,
        fullText: `${h.label}: ${h.scans} ta skan, ${h.joins} ta kanalga a’zo`,
      }));
    }
    if (period === 'weekly') {
      return stats.charts.daily.slice(-7).map((d) => ({
        label: d.label,
        scans: d.scans,
        joins: d.joins,
        fullText: `${d.label} (${d.date}): ${d.scans} ta skan, ${d.joins} ta obuna`,
      }));
    }
    if (period === 'monthly') {
      return stats.charts.daily.map((d) => ({
        label: d.label,
        scans: d.scans,
        joins: d.joins,
        fullText: `${d.label} (${d.date}): ${d.scans} ta skan, ${d.joins} ta obuna`,
      }));
    }
    // Yearly
    return stats.charts.monthly.map((m) => ({
      label: m.label.slice(0, 3),
      scans: m.scans,
      joins: m.joins,
      fullText: `${m.label}: ${m.scans} ta skan, ${m.joins} ta obuna`,
    }));
  }, [stats?.charts, period]);

  // Max value for scaling chart bars
  const maxChartValue = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(...chartData.map((d) => Math.max(d.scans, d.joins)), 1);
  }, [chartData]);



  // ==========================================
  // 1. LOGIN SCREEN
  // ==========================================
  if (!authed) {
    return (
      <main className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel login-card" style={{ width: 'min(100% - 32px, 420px)', padding: '36px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(56,189,248,0.2) 100%)',
                border: '1px solid rgba(245,158,11,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 28px rgba(245,158,11,0.25)',
                marginBottom: 14,
              }}
            >
              <img src="/school-logo.svg" alt="Sharofov School Logo" width={44} height={44} />
            </div>
            <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>
              SHAROFOV SCHOOL
            </p>
            <h1 style={{ margin: '6px 0 0 0', fontSize: 26, fontWeight: 900, color: '#fff' }}>Admin Boshqaruv</h1>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              Statistika va referallarni boshqarish tizimi
            </p>
          </div>

          <form onSubmit={login} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                Admin Login
              </label>
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Login kiriting..."
                required
                className="modern-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                Maxfiy Parol
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting..."
                required
                className="modern-input"
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
              className="btn-primary-gold"
              style={{ width: '100%', marginTop: 6 }}
            >
              {loginLoading ? 'Kirilmoqda...' : 'Tizimga Kirish ➔'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 24, marginBottom: 0 }}>
            🔒 Xavfsiz Shifrlangan Aloqa
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED EXECUTIVE DASHBOARD
  // ==========================================
  return (
    <div className="admin-wrapper">
      <div style={{ width: 'min(100% - 32px, 1180px)', margin: '0 auto', display: 'grid', gap: 24 }}>
        
        {/* TOP HEADER */}
        <header
          className="glass-panel"
          style={{
            padding: '18px 24px',
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
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(56,189,248,0.2) 100%)',
                border: '1px solid rgba(245,158,11,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/school-logo.svg" alt="Logo" width={32} height={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Sharofov School
                </span>
                <span className="badge badge-green">
                  <span className="live-dot" /> Jonli Kuzatuv
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#fff' }}>
                Admin Analytics & Referallar
              </h1>
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
              onClick={() => {
                void loadStats();
              }}
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


        {/* STATS DASHBOARD */}
        <div style={{ display: 'grid', gap: 24 }}>
            
            {/* TIME FILTER SELECTOR */}
            <div
              className="glass-panel"
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                  ⏳ Filtrlash davri:
                </span>
                <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                  {period === 'daily' && 'Bugungi (Kunlik)'}
                  {period === 'weekly' && 'Oxirgi 7 kun'}
                  {period === 'monthly' && 'Shu oylik (30 kun)'}
                  {period === 'yearly' && 'Shu yillik (12 oy)'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  background: 'rgba(6, 11, 23, 0.8)',
                  padding: 3,
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  onClick={() => setPeriod('daily')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: period === 'daily' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                    color: period === 'daily' ? '#fbbf24' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Kunlik (Bugun)
                </button>
                <button
                  onClick={() => setPeriod('weekly')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: period === 'weekly' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    color: period === 'weekly' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  7 kun
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: period === 'monthly' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                    color: period === 'monthly' ? '#c084fc' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Oylik (Shu oy)
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: period === 'yearly' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    color: period === 'yearly' ? '#34d399' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Yillik (Shu yil)
                </button>
              </div>
            </div>

            {/* 2 CORE STAT CARDS */}
            <section className="stats-grid">
              
              {/* CARD 1: QR SCANS */}
              <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #38bdf8, #2563eb)' } as React.CSSProperties}>
                <div>
                  <div className="stat-header">
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                      QR Kod Skanerlari
                    </span>
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
                  <div className="stat-value">
                    {period === 'daily' && (stats?.scans.today ?? 0).toLocaleString()}
                    {period === 'weekly' && chartData.reduce((acc, c) => acc + c.scans, 0).toLocaleString()}
                    {period === 'monthly' && (stats?.scans.month ?? 0).toLocaleString()}
                    {period === 'yearly' && (stats?.scans.year ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="stat-subtext">
                  <span className="badge badge-blue">
                    Jami: {(stats?.scans.total ?? 0).toLocaleString()} ta
                  </span>
                  <span>
                    {period === 'daily' && 'Bugungi ochilishlar'}
                    {period === 'weekly' && '7 kunlik ochilishlar'}
                    {period === 'monthly' && 'Ushbu oydagi ochilishlar'}
                    {period === 'yearly' && 'Ushbu yildagi ochilishlar'}
                  </span>
                </div>
              </div>

              {/* CARD 2: TELEGRAM CHANNEL MEMBERS & CLICKS */}
              <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #c084fc, #7c3aed)' } as React.CSSProperties}>
                <div>
                  <div className="stat-header">
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                      Kanal A’zolari
                    </span>
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
                    {stats?.channel.totalMembers !== null && stats?.channel.totalMembers !== undefined
                      ? stats.channel.totalMembers.toLocaleString()
                      : '—'}
                  </div>
                </div>
                <div className="stat-subtext">
                  <span className="badge badge-purple">
                    {stats?.channel.conversionRate ?? 0}% konversiya
                  </span>
                  <span>
                    {stats?.channel.clicksTotal ?? 0} marta obuna bosilgan
                  </span>
                </div>
              </div>



            </section>

            {/* DYNAMIC VISUAL CHART */}
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
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    {period === 'daily' && '📅 Bugungi Soatbay Faollik Grafigi (24 Soat)'}
                    {period === 'weekly' && '📊 Oxirgi 7 Kunlik Faollik Grafigi'}
                    {period === 'monthly' && '🗓️ Ushbu Oydagi Kunbay Dinamika (30 Kun)'}
                    {period === 'yearly' && '🏛️ Ushbu Yildagi Oylik Dinamika (12 Oy)'}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
                    Ko‘k rang — QR kod skanerlari, sariq/oltin rang — kanalga qo‘shilishlar
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8' }} />
                    <span>Skanerlar</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fbbf24' }} />
                    <span>Kanal a’zosi</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="chart-container" style={{ minHeight: 220 }}>
                {chartData.map((d, idx) => {
                  const heightPercent = Math.max(Math.round((d.scans / maxChartValue) * 100), 5);
                  const isPeak = d.scans === maxChartValue && d.scans > 0;

                  return (
                    <div key={idx} className="chart-bar-col">
                      <div className="chart-bar-wrapper">
                        <div className="chart-tooltip">
                          {d.fullText}
                        </div>
                        <div
                          className={`chart-bar ${isPeak ? 'peak' : ''}`}
                          style={{
                            height: `${heightPercent}%`,
                          }}
                        />
                      </div>
                      <div
                        className="chart-label"
                        style={{
                          fontSize: period === 'monthly' ? 10 : 11,
                          color: isPeak ? '#fbbf24' : '#94a3b8',
                          fontWeight: isPeak ? 800 : 500,
                        }}
                      >
                        {d.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats?.channel.error && (
                <p style={{ fontSize: 12, color: '#fbbf24', marginTop: 14, marginBottom: 0 }}>
                  ℹ️ Bildirishnoma: {stats.channel.error}
                </p>
              )}
            </section>
          </div>
      </div>
    </div>
  );
}
