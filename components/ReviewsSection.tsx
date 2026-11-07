'use client';

import { useState } from 'react';

type ReviewItem = {
  id: string;
  name: string;
  role: string;
  rating: number;
  message: string;
  date: string;
};

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Dilnoza R.',
    role: 'Ota-ona',
    rating: 5,
    message: 'Farzandim 6 oydan beri Ingliz tili va Pochemuchka kurslariga qatnayapti. O‘qituvchilarning bolalarga mehr bilan yondashishi va co-working zonasidagi muhit juda yoqdi. Rahmat!',
    date: '3 kun oldin',
  },
  {
    id: '2',
    name: 'Bobur K.',
    role: 'Bitiruvchi',
    rating: 5,
    message: 'Sharofov Schoolda Arab tili va Rus tilini o‘rgandim. Har oylik testlar va o‘qituvchilarning alohida yordami natijasida imtihonlardan yuqori ball to‘pladim.',
    date: '1 hafta oldin',
  },
  {
    id: '3',
    name: 'Ziyoda M.',
    role: 'O‘quvchi',
    rating: 5,
    message: 'Darslar juda qiziqarli o‘tiladi, kitoblari ham juda qulay va tushunarli tuzilgan. Har doim do‘stlarimga ham tavsiya qilaman!',
    date: '2 hafta oldin',
  },
];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role || !message.trim()) return;

    setLoading(true);

    const newReview: ReviewItem = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      rating: Number(rating) || 5,
      message: message.trim(),
      date: 'Hozirgina',
    };

    setReviews((prev) => [newReview, ...prev]);
    setSubmitted(true);

    // Send real-time notification to Telegram Bot for admin
    try {
      fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          info: `⭐ Yangi Fikr Qoldirildi!`,
          message: `${name} (${role}) — ${'★'.repeat(rating)}: "${message}"`,
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      }).catch(() => {});
    } catch {}

    setName('');
    setRole('');
    setMessage('');
    setRating(5);
    setHoverRating(0);
    setLoading(false);

    setTimeout(() => {
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-wrap">
        <div className="reviews-head">
          <div className="eyebrow">Sizning fikringiz biz uchun muhim</div>
          <h2>O‘quvchilar va ota-onalar fikrlari</h2>
          <p>
            SHAROFOV SCHOOL haqidagi taassurotingizni biz bilan baham ko‘ring. Sizning fikringiz
            xizmatlarimizni yanada yaxshilashga yordam beradi.
          </p>
        </div>

        <div className="review-layout">
          {/* Review Form Panel */}
          <div className="review-panel">
            <h3>Fikringizni qoldiring</h3>

            {submitted && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>✓</span>
                <span>Fikringiz muvaffaqiyatli qabul qilindi. Rahmat!</span>
              </div>
            )}

            <form className="review-form" id="reviewForm" onSubmit={handleSubmit}>
              <label>
                Ismingiz
                <input
                  id="reviewName"
                  type="text"
                  placeholder="Ismingizni kiriting"
                  required
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Siz kim sifatida fikr bildiryapsiz?
                <select
                  id="reviewRole"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Tanlang</option>
                  <option value="O‘quvchi">O‘quvchi</option>
                  <option value="Ota-ona">Ota-ona</option>
                  <option value="Bitiruvchi">Bitiruvchi</option>
                </select>
              </label>

              <div>
                <span style={{ display: 'block', marginBottom: 8, color: '#49365a', fontWeight: 650, fontSize: '0.94rem' }}>
                  Bahoyingiz
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        title={`${star} yulduz`}
                        aria-label={`${star} yulduz`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          fontSize: '2rem',
                          lineHeight: 1,
                          color: isFilled ? '#e4ae37' : '#d9cde2',
                          textShadow: isFilled ? '0 0 10px rgba(228, 174, 55, 0.4)' : 'none',
                          transition: 'all 0.15s ease',
                          transform: isFilled ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        ★
                      </button>
                    );
                  })}

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#68238e',
                      background: '#f2e9fb',
                      padding: '4px 10px',
                      borderRadius: 20,
                      marginLeft: 8,
                    }}
                  >
                    {activeRating === 5 && '5 — A’lo'}
                    {activeRating === 4 && '4 — Yaxshi'}
                    {activeRating === 3 && '3 — Qoniqarli'}
                    {activeRating === 2 && '2 — O‘rtacha'}
                    {activeRating === 1 && '1 — Qoniqarsiz'}
                  </span>
                </div>
              </div>

              <label>
                Fikringiz
                <textarea
                  id="reviewText"
                  placeholder="Taassurotingizni yozing..."
                  required
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              <button className="review-submit" type="submit" disabled={loading}>
                {loading ? 'Yuborilmoqda...' : 'Fikrni yuborish'}
              </button>

              <p className="review-note">
                Qoldirilgan fikringiz o‘quv markazimiz jamoasi tomonidan ko‘rib chiqiladi va sahifada
                aks ettiriladi.
              </p>
            </form>
          </div>

          {/* Review List Panel */}
          <div className="review-panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0 }}>Foydalanuvchilar fikrlari</h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#f2e9fb',
                  color: '#4b1684',
                  padding: '4px 10px',
                  borderRadius: 20,
                }}
              >
                {reviews.length} ta fikr
              </span>
            </div>

            <div className="review-list" id="reviewList">
              {reviews.length === 0 ? (
                <div className="review-empty">
                  Hali fikrlar joylanmagan.
                  <br />
                  O‘z taassurotingizni birinchi bo‘lib qoldiring!
                </div>
              ) : (
                reviews.map((r) => (
                  <article key={r.id} className="review-card">
                    <div className="review-card-top">
                      <div>
                        <strong>{r.name}</strong>
                        <span style={{ color: '#8b7d91', fontSize: 13, marginLeft: 6 }}>
                          · {r.role}
                        </span>
                      </div>
                      <div className="stars" aria-label={`${r.rating} yulduz`}>
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <p>{r.message}</p>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: '#94a3b8',
                        textAlign: 'right',
                      }}
                    >
                      {r.date}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
