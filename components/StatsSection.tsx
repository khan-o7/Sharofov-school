'use client';

import { useEffect, useRef, useState } from 'react';

type StatConfig = {
  id: string;
  target: number;
  suffix: string;
  label: string;
};

const STATS_DATA: StatConfig[] = [
  { id: 'graduates', target: 1000, suffix: '+', label: 'Bitiruvchilar' },
  { id: 'pass_rate', target: 95, suffix: '%', label: 'O‘zlashtirgan o‘quvchilar' },
  { id: 'exam_score', target: 97, suffix: '+', label: 'Imtihondan jamlagan ball' },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    graduates: 0,
    pass_rate: 0,
    exam_score: 0,
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let animFrame: number;

    const startCounting = () => {
      const startTime = performance.now();
      const duration = 1800; // 1.8 seconds smooth count

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3);

        setCounts({
          graduates: Math.floor(ease * 1000),
          pass_rate: Math.floor(ease * 95),
          exam_score: Math.floor(ease * 97),
        });

        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setCounts({
            graduates: 1000,
            pass_rate: 95,
            exam_score: 97,
          });
        }
      };

      // Reset to 0 then animate
      setCounts({ graduates: 0, pass_rate: 0, exam_score: 0 });
      animFrame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounting();
          }
        });
      },
      {
        threshold: 0.25, // Triggers when 25% of section is visible
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <section className="stats" id="stats" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Natijalarimiz</span>
          <h2>O‘quv markaz statistikasi</h2>
          <p>Birgalikdagi mehnatimiz va o‘quvchilarimiz natijalari.</p>
        </div>

        <div className="stats-grid">
          {STATS_DATA.map((item) => (
            <div key={item.id} className="stat">
              <b style={{ fontVariantNumeric: 'tabular-nums' }}>
                {counts[item.id]}
                {item.suffix}
              </b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
