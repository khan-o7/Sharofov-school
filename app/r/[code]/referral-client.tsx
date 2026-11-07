'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import confetti from 'canvas-confetti';

type ReferralClientProps = {
  code: string;
  referralId: string | null;
};

export default function ReferralClient({ code, referralId }: ReferralClientProps) {
  const channelUrl = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/sharofovschool';
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'sharofov_school_bot';

  // State
  const [subscribed, setSubscribed] = useState(false);

  // Auto report unhandled client runtime errors to Telegram
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      try {
        fetch('/api/report-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: e.message,
            stack: e.error?.stack,
            url: window.location.href,
            info: 'Foydalanuvchi sahifasida runtime xatolik',
          }),
        });
      } catch {}
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      const end = Date.now() + 1200;
      const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#10b981'];
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // Confetti fallback
    }
  }, []);

  // Track Telegram Channel link click
  const handleTelegramClick = async () => {
    setSubscribed(true);
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          eventType: 'channel_click',
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    } catch {
      // ignore
    }
  };



  return (
    <main className="container-landing">
      {/* Top Brand Nav */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0 20px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/school-logo.svg"
            alt="Sharofov School Logo"
            width={40}
            height={40}
            style={{ filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', color: '#fff' }}>
              SHAROFOV SCHOOL
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>O‘quv Markazi • Rasmiy Aksiya</div>
          </div>
        </div>

        <span className="badge-live">
          <span className="pulse-dot" /> Aksiya Faol
        </span>
      </header>

      <div style={{ display: 'grid', gap: 24 }}>
        
        {/* HERO CELEBRATION CARD */}
        <section className="glass-panel glass-panel-gold" style={{ padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          
          {/* Subtle gold glow circle */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '260px',
              height: '140px',
              background: 'radial-gradient(ellipse, rgba(245,158,11,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* 3D Prize Box Artwork */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, animation: 'floatSoft 4s ease-in-out infinite' }}>
            <img
              src="/reward-banner.jpg"
              alt="50 000 so'm Mukofot"
              width={140}
              height={140}
              className="prize-box-img"
              style={{
                width: '140px',
                height: '140px',
                maxWidth: '140px',
                maxHeight: '140px',
                borderRadius: 24,
                boxShadow: '0 12px 35px -5px rgba(245, 158, 11, 0.4), 0 0 0 2px rgba(245, 158, 11, 0.3)',
                display: 'block',
                objectFit: 'cover',
                margin: '0 auto',
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <span className="badge-gold">
              🎁 MAXSUS PUL MUKOFOTI
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(24px, 5.5vw, 34px)',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: 10,
              color: '#ffffff',
            }}
          >
            Tabriklaymiz! Yutuqqa ega bo‘ldingiz!
          </h1>

          <div
            style={{
              fontSize: 'clamp(21px, 5vw, 30px)',
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            <span className="text-gold-gradient">
              <span style={{ whiteSpace: 'nowrap' }}>50&nbsp;000&nbsp;so‘m</span> pul mukofoti Sizniki bo‘lishi mumkin!
            </span>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: 'clamp(14px, 3.8vw, 16px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Mukofotni kafolatlangan holda qo‘lga kiritish uchun quyidagi oddiy shartlarni bajaring:
          </p>
        </section>

        {/* SHART 1: TELEGRAM KANALGA OBUNA BO'LING */}
        <section
          className="glass-panel"
          style={{
            padding: '24px',
            border: subscribed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)',
            background: subscribed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: subscribed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 136, 204, 0.18)',
                color: subscribed ? '#34d399' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
                flexShrink: 0,
                border: subscribed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(0, 136, 204, 0.3)',
              }}
            >
              {subscribed ? '✓' : '1'}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 800, letterSpacing: '0.06em' }}>
                1-SHART
              </div>
              <h2 style={{ fontSize: 'clamp(18px, 4.2vw, 22px)', fontWeight: 800, color: '#fff', margin: '2px 0 4px 0' }}>
                Telegram kanalga obuna bo‘ling
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                (Kanalimizga obuna bo‘lib, adminga taqdim etasiz)
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* Telegram Button */}
            <a
              href={channelUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleTelegramClick}
              className="btn-telegram"
              style={{ width: '100%' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"
                  fill="currentColor"
                />
              </svg>
              ✈️ @sharofovschool kanaliga obuna bo‘lish
            </a>

            {/* Telegram Channel Info pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(6, 11, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📢</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Sharofov School Rasmiy Kanali</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Imtihonlar, olimpiadalar va o‘quv yangiliklari</div>
                </div>
              </div>
              <span className="badge-live" style={{ fontSize: 11 }}>Faol</span>
            </div>

            {subscribed && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>✓</span>
                <span>Telegram kanal ochildi. Obuna bo‘lib, adminga taqdim etasiz.</span>
              </div>
            )}
          </div>
        </section>

        {/* SHART 2: O'Z DO'STINGIZNI TAKLIF ETING */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
                flexShrink: 0,
                border: '1px solid rgba(245, 158, 11, 0.35)',
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 800, letterSpacing: '0.06em' }}>
                2-SHART
              </div>
              <h2 style={{ fontSize: 'clamp(18px, 4.2vw, 22px)', fontWeight: 800, color: '#fff', margin: '2px 0 4px 0' }}>
                O‘z do‘stingizni taklif eting
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                Har bir taklif qilingan do‘stingiz uchun pul mukofotini qo‘lga kiriting
              </p>
            </div>
          </div>

          {/* CRITICAL NOTICE BOX AS SPECIFIED IN USER PROMPT */}
          <div
            style={{
              padding: '18px 22px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              marginBottom: 20,
              boxShadow: '0 8px 24px -5px rgba(245, 158, 11, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>💡</span>
              <div
                style={{
                  fontSize: 'clamp(14px, 3.8vw, 15.5px)',
                  color: '#fef3c7',
                  lineHeight: 1.75,
                  letterSpacing: '0.025em',
                  wordSpacing: '0.04em',
                }}
              >
                <strong style={{ color: '#fbbf24', display: 'block', marginBottom: 6, fontSize: 16, letterSpacing: '0.04em' }}>
                  Eslatma:
                </strong>
                Do‘stingiz kurs tanlab oylik to‘lovni qilishi bilanoq Sizga har bir do‘stingiz uchun{' '}
                <strong
                  style={{
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textDecoration: 'underline',
                    textDecorationColor: '#f59e0b',
                    textUnderlineOffset: '4px',
                    fontWeight: 800,
                  }}
                >
                  50&nbsp;000&nbsp;so‘m pul mukofoti
                </strong>{' '}
                taqdim etiladi.
              </div>
            </div>
          </div>


        </section>

        {/* HOW REWARD IS PAID STEPPER */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
            🏆 Mukofotni Qanday Olasiz?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div
              style={{
                padding: '18px 16px',
                borderRadius: 14,
                background: 'rgba(6, 11, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>📱</div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: 13, marginBottom: 4 }}>1-QADAM</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>Obuna Bo‘ling</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Kanalga a’zo bo‘ling va havolani do‘stingizga yuboring
              </div>
            </div>

            <div
              style={{
                padding: '18px 16px',
                borderRadius: 14,
                background: 'rgba(6, 11, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>🎓</div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: 13, marginBottom: 4 }}>2-QADAM</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>Do‘stingiz Boshlaydi</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Do‘stingiz kurs tanlab, oylik to‘lovni amalga oshiradi
              </div>
            </div>

            <div
              style={{
                padding: '18px 16px',
                borderRadius: 14,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>💰</div>
              <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: 13, marginBottom: 4 }}>3-QADAM</div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 14, marginBottom: 4 }}>50 000 So‘m Mukofot</div>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                Sizga naqd yoki kartangizga pul mukofoti to‘lab beriladi!
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: 13,
              color: '#bae6fd',
              textAlign: 'center',
            }}
          >
            🔥 <strong>Cheklov yo‘q:</strong> 5 ta do‘st = <span style={{ whiteSpace: 'nowrap' }}>250&nbsp;000&nbsp;so‘m</span>, 10 ta do‘st = <span style={{ whiteSpace: 'nowrap' }}>500&nbsp;000&nbsp;so‘m</span> pul mukofoti!
          </div>
        </section>

        {/* SHAROFOV SCHOOL ABOUT & COURSES */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span className="badge-gold">SHAROFOV SCHOOL HAQIDA</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 8 }}>
              Sifatli Ta’lim — Buyuk Kelajak Garovi
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 480, margin: '6px auto 0 auto' }}>
              Sharofov School o‘quv markazida tajribali mutaxassislar va zamonaviy o‘qitish metodikasi asosida darslar olib boriladi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {[
              'Ingliz tili',
              'Rus tili',
              'Arab tili',
              'Maktabga tayyorlov (Pochemuchka)',
              'Matematika',
            ].map((c) => (
              <div
                key={c}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(6, 11, 23, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                ✓ {c}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              href="https://t.me/sharofov_school"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: 13 }}
            >
              📞 Administrator bilan bog‘lanish (Telegram)
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#64748b' }}>
          <div>© {new Date().getFullYear()} SHAROFOV SCHOOL. Barcha huquqlar himoyalangan.</div>
          <div style={{ marginTop: 4 }}>QR Referal va Rag‘batlantirish Tizimi</div>
        </footer>

      </div>
    </main>
  );
}
