'use client';

import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

type SchoolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
};

export default function SchoolModal({ isOpen, onClose, referralCode = 'main' }: SchoolModalProps) {
  const channelUrl = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/sharofovschool';
  const defaultSiteUrl = 'https://sharofov-school.vercel.app';
  const [shareLink, setShareLink] = useState(`${defaultSiteUrl}/r/${referralCode}`);

  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Sync shareLink on client to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/r/${referralCode}`);
    }
  }, [referralCode]);

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll and always scroll modal body to top when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trigger celebration confetti on modal open
  useEffect(() => {
    if (!isOpen) return;

    try {
      const end = Date.now() + 1400;
      const colors = ['#f59e0b', '#fbbf24', '#7134ae', '#38bdf8', '#10b981'];
      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 10000,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 10000,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // Confetti fallback
    }
  }, [isOpen]);

  // Track Telegram Channel click
  const handleTelegramClick = async () => {
    setSubscribed(true);
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: referralCode,
          eventType: 'channel_click',
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
    } catch {
      // ignore
    }
  };

  // Copy referral link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: referralCode,
          eventType: 'referral_share',
          metadata: { type: 'copy_link' },
        }),
      }).catch(() => {});
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="modal-container" ref={modalRef}>
        {/* Sticky Header Bar */}
        <div className="modal-header-bar">
          <div className="modal-brand">
            <img
              src="/school-logo.svg"
              alt="Sharofov School Logo"
              width={34}
              height={34}
              style={{ filter: 'drop-shadow(0 2px 8px rgba(113, 52, 174, 0.25))' }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.04em', color: '#2d0759' }}>
                SHAROFOV SCHOOL
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                Rasmiy Mukofot & Aksiya
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge-live">
              <span className="pulse-dot" /> Aksiya Faol
            </span>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Yopish (ESC)"
              aria-label="Yopish"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body (Always resets to top) */}
        <div className="modal-body" ref={modalBodyRef}>
          {/* HERO CELEBRATION CARD */}
          <section
            className="glass-panel glass-panel-gold"
            style={{
              padding: '28px 20px 24px 20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Subtle gold glow circle */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '260px',
                height: '140px',
                background: 'radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* 3D Prize Box Artwork - STRICT SIZING TO PREVENT STRETCHING OR COLLAPSING */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                minHeight: 140,
                height: 140,
                width: '100%',
                animation: 'floatSoft 4s ease-in-out infinite',
              }}
            >
              <img
                src="/reward-banner.jpg"
                alt="50 000 so‘m Mukofot"
                width={140}
                height={140}
                loading="eager"
                decoding="async"
                className="prize-box-img"
                style={{
                  width: 140,
                  height: 140,
                  minWidth: 140,
                  minHeight: 140,
                  maxWidth: 140,
                  maxHeight: 140,
                  flexShrink: 0,
                  borderRadius: 24,
                  boxShadow: '0 14px 40px -5px rgba(245, 158, 11, 0.4), 0 0 0 2px rgba(245, 158, 11, 0.35)',
                  display: 'block',
                  objectFit: 'cover',
                  margin: '0 auto',
                  aspectRatio: '1 / 1',
                }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <span className="badge-gold">
                🎁 MAXSUS PUL MUKOFOTI
              </span>
            </div>

            <h1
              id="modal-headline"
              style={{
                fontSize: 'clamp(22px, 5vw, 30px)',
                fontWeight: 900,
                lineHeight: 1.25,
                marginBottom: 8,
                color: '#2d0759',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Tabriklaymiz! Yutuqqa ega bo‘ldingiz!
            </h1>

            <div
              style={{
                fontSize: 'clamp(19px, 4.5vw, 26px)',
                fontWeight: 800,
                lineHeight: 1.3,
                marginBottom: 14,
              }}
            >
              <span className="text-gold-gradient">
                <span style={{ whiteSpace: 'nowrap' }}>50&nbsp;000&nbsp;so‘m</span> pul mukofoti Sizniki bo‘lishi mumkin!
              </span>
            </div>

            <p
              style={{
                color: '#4b5563',
                fontSize: 'clamp(13px, 3.6vw, 15px)',
                maxWidth: 500,
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Mukofotni kafolatlangan holda qo‘lga kiritish uchun quyidagi oddiy shartlarni bajaring:
            </p>
          </section>

          {/* SHART 1: TELEGRAM KANALGA OBUNA BO'LING */}
          <section
            className="glass-panel"
            style={{
              padding: '22px 20px',
              border: subscribed ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(113, 52, 174, 0.14)',
              background: subscribed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: subscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 136, 204, 0.12)',
                  color: subscribed ? '#059669' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 17,
                  flexShrink: 0,
                  border: subscribed ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1.5px solid rgba(0, 136, 204, 0.25)',
                }}
              >
                {subscribed ? '✓' : '1'}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#d97706', fontWeight: 800, letterSpacing: '0.06em' }}>
                  1-SHART
                </div>
                <h2 style={{ fontSize: 'clamp(17px, 4vw, 20px)', fontWeight: 800, color: '#2d0759', margin: '2px 0 4px 0' }}>
                  Telegram kanalga obuna bo‘ling
                </h2>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                  (Kanalimizga obuna bo‘lib, adminga taqdim etasiz)
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <a
                href={channelUrl}
                target="_blank"
                rel="noreferrer"
                onClick={handleTelegramClick}
                className="btn-telegram"
                style={{ width: '100%' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"
                    fill="currentColor"
                  />
                </svg>
                ✈️ @sharofovschool kanaliga obuna bo‘lish
              </a>

              {subscribed && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#065f46',
                    fontWeight: 650,
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

          {/* SHART 2: O'Z DO'STINGIZNI TAKLIF ETING (CLEAN SHARING) */}
          <section className="glass-panel" style={{ padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.14)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 17,
                  flexShrink: 0,
                  border: '1.5px solid rgba(245, 158, 11, 0.35)',
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#d97706', fontWeight: 800, letterSpacing: '0.06em' }}>
                  2-SHART
                </div>
                <h2 style={{ fontSize: 'clamp(17px, 4vw, 20px)', fontWeight: 800, color: '#2d0759', margin: '2px 0 4px 0' }}>
                  O‘z do‘stingizni taklif eting
                </h2>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                  Har bir taklif qilingan do‘stingiz uchun pul mukofotini qo‘lga kiriting
                </p>
              </div>
            </div>

            {/* MANDATORY NOTICE BOX */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.85) 0%, rgba(255, 251, 235, 0.95) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.45)',
                marginBottom: 18,
                boxShadow: '0 8px 24px -5px rgba(245, 158, 11, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>💡</span>
                <div
                  style={{
                    fontSize: 'clamp(13px, 3.6vw, 14.5px)',
                    color: '#78350f',
                    lineHeight: 1.7,
                  }}
                >
                  <strong style={{ color: '#b45309', display: 'block', marginBottom: 4, fontSize: 15 }}>
                    Eslatma:
                  </strong>
                  Do‘stingiz kurs tanlab oylik to‘lovni qilishi bilanoq Sizga har bir do‘stingiz uchun{' '}
                  <strong
                    style={{
                      color: '#92400e',
                      whiteSpace: 'nowrap',
                      textDecoration: 'underline',
                      textDecorationColor: '#f59e0b',
                      textUnderlineOffset: '3px',
                      fontWeight: 800,
                    }}
                  >
                    50&nbsp;000&nbsp;so‘m pul mukofoti
                  </strong>{' '}
                  taqdim etiladi.
                </div>
              </div>
            </div>

            {/* QUICK SHARING BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(
                  'Salom! SHAROFOV SCHOOL o‘quv markazining maxsus aksiyasiga taklif qilaman. Bu yerda sifatli ta’lim va 50 000 so‘m pul mukofotlari bor:'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-telegram"
                style={{ fontSize: 14, padding: '14px 18px', width: '100%' }}
              >
                ✈️ Do‘stlarga ulashish (Telegram)
              </a>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyLink}
                style={{ fontSize: 14, padding: '14px 18px', width: '100%' }}
              >
                {copied ? '✓ Havola nusxalandi!' : '🔗 Havolani nusxalash'}
              </button>
            </div>
          </section>

          {/* MUKOFOTNI QANDAY OLASIZ STEPPER */}
          <section className="glass-panel" style={{ padding: '22px 20px' }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#2d0759', marginBottom: 14, textAlign: 'center' }}>
              🏆 Mukofotni Qanday Olasiz?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div
                style={{
                  padding: '16px 14px',
                  borderRadius: 14,
                  background: 'rgba(248, 244, 252, 0.85)',
                  border: '1px solid rgba(113, 52, 174, 0.12)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📱</div>
                <div style={{ fontWeight: 800, color: '#d97706', fontSize: 12, marginBottom: 4 }}>1-QADAM</div>
                <div style={{ fontWeight: 700, color: '#2d0759', fontSize: 13.5, marginBottom: 4 }}>Obuna Bo‘ling</div>
                <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                  Kanalga a’zo bo‘ling va havolani do‘stingizga yuboring
                </div>
              </div>

              <div
                style={{
                  padding: '16px 14px',
                  borderRadius: 14,
                  background: 'rgba(248, 244, 252, 0.85)',
                  border: '1px solid rgba(113, 52, 174, 0.12)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
                <div style={{ fontWeight: 800, color: '#d97706', fontSize: 12, marginBottom: 4 }}>2-QADAM</div>
                <div style={{ fontWeight: 700, color: '#2d0759', fontSize: 13.5, marginBottom: 4 }}>Do‘stingiz Boshlaydi</div>
                <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                  Do‘stingiz kurs tanlab, oylik to‘lovni amalga oshiradi
                </div>
              </div>

              <div
                style={{
                  padding: '16px 14px',
                  borderRadius: 14,
                  background: 'rgba(254, 243, 199, 0.85)',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>💰</div>
                <div style={{ fontWeight: 800, color: '#d97706', fontSize: 12, marginBottom: 4 }}>3-QADAM</div>
                <div style={{ fontWeight: 800, color: '#b45309', fontSize: 13.5, marginBottom: 4 }}>50 000 So‘m</div>
                <div style={{ fontSize: 11.5, color: '#78350f' }}>
                  Sizga naqd yoki kartangizga pul mukofoti to‘lab beriladi!
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(240, 249, 255, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontSize: 12.5,
                color: '#0369a1',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              🔥 <strong style={{ color: '#0284c7' }}>Cheklov yo‘q:</strong> 5 ta do‘st = 250 000 so‘m, 10 ta do‘st = 500 000 so‘m pul mukofoti!
            </div>
          </section>

          {/* COURSES & ADMIN CONTACT */}
          <section className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span className="badge-gold">SHAROFOV SCHOOL KURSLARI</span>
              <p style={{ fontSize: 13, color: '#4b5563', margin: '8px auto 0 auto', fontWeight: 600 }}>
                Ingliz tili • Rus tili • Arab tili • Pochemuchka • Matematika
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a
                href="https://t.me/sharofov_school"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: 13, width: '100%' }}
              >
                📞 Administrator bilan bog‘lanish (Telegram)
              </a>
            </div>
          </section>

          {/* ANIMATED PULSING BATAFSIL BUTTON — CLOSES MODAL & OPENS MAIN SITE */}
          <section
            className="glass-panel"
            style={{
              padding: '20px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(242, 233, 251, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1.5px solid rgba(113, 52, 174, 0.25)',
              boxShadow: '0 12px 35px -8px rgba(113, 52, 174, 0.18)',
            }}
          >
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 12 }}>
              Sharofov School o‘quv markazi va kurslar haqida to‘liq tanishish uchun:
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-batafsil-pulse"
              title="Asosiy saytga o‘tish va to‘liq ma’lumot olish"
              aria-label="Batafsil asosiy saytga o‘tish"
            >
              <span>Batafsil</span>
              <span className="arrow-anim">➔</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
