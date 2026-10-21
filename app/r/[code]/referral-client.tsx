'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global { interface Window { onTelegramAuth?: (user: Record<string, unknown>) => void } }
type CheckResult = { ok?: boolean; isMember?: boolean; error?: string };
export default function ReferralClient({ code, referralId }: { code: string; referralId: string | null }) {
  const [telegramUser, setTelegramUser] = useState<{id:number; first_name?:string; username?:string} | null>(null);
  const [status, setStatus] = useState<'idle'|'checking'|'member'|'not-member'|'error'>('idle');
  const [message, setMessage] = useState('');
  const channel = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/sharofovschool';
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  async function checkMembership(userId?: number) {
    const id = userId ?? telegramUser?.id;
    if (!id) { setMessage('Avval Telegram orqali shaxsingizni tasdiqlang, keyin obunani tekshiramiz.'); return; }
    setStatus('checking');
    try {
      const res = await fetch('/api/check-subscription', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ userId:id, code }), cache:'no-store' });
      const data = await res.json() as CheckResult;
      if (!res.ok) throw new Error(data.error || 'Tekshirishda xatolik yuz berdi.');
      if (data.isMember) { setStatus('member'); setMessage('Obuna tasdiqlandi. Tabriklaymiz!'); }
      else { setStatus('not-member'); setMessage('Kanalga obuna bo‘ling, so‘ng shu sahifaga qaytib qayta tekshiring.'); }
    } catch (e) { setStatus('error'); setMessage(e instanceof Error ? e.message : 'Xatolik.'); }
  }
  useEffect(() => {
    window.onTelegramAuth = async (raw) => {
      try {
        const res = await fetch('/api/telegram-auth', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(raw) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Telegram tasdiqlash muvaffaqiyatsiz.');
        const u = raw as {id:number; first_name?:string; username?:string}; setTelegramUser(u); setMessage('Telegram akkauntingiz tasdiqlandi. Obuna tekshirilmoqda…'); await checkMembership(u.id);
      } catch (e) { setStatus('error'); setMessage(e instanceof Error ? e.message : 'Xatolik.'); }
    };
    return () => { delete window.onTelegramAuth; };
  }, []);
  useEffect(() => { if (telegramUser?.id && status !== 'member') { const timer = window.setInterval(() => { void checkMembership(telegramUser.id); }, 8000); return () => window.clearInterval(timer); } }, [telegramUser?.id, status]);
  return <main className="wrap"><section className="panel stack" style={{maxWidth:680,margin:'2vh auto'}}>
    <div className="center"><div style={{fontSize:38}}>🎓</div><p className="muted" style={{marginBottom:4}}>SHAROFOV SCHOOL</p><h1 style={{margin:'4px 0'}}>Aksiyada qatnashing</h1><p className="muted">Davom etish uchun Telegram kanalimizga obuna bo‘ling.</p></div>
    {status !== 'member' ? <>
      <a className="btn blue" href={channel} target="_blank" rel="noreferrer">✈ Telegram’ni ochish — kanalga obuna bo‘lish</a>
      <div className="notice"><strong>Obunani tekshirish uchun</strong><p className="small" style={{marginBottom:0}}>Telegram akkauntingizni bir marta tasdiqlang. Bu saytga kim obuna bo‘lganini bilish imkonini beradi.</p></div>
      {bot ? <><div id="telegram-login-container" className="center"/><Script src="https://telegram.org/js/telegram-widget.js?22" strategy="afterInteractive" data-telegram-login={bot} data-size="large" data-userpic="false" data-request-access="write" data-onauth="onTelegramAuth(user)" /></> : <p className="small error">Bot username sozlanmagan. .env.local faylida NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ni kiriting.</p>}
      <button className="btn secondary" onClick={() => void checkMembership()}>Obunani tekshirish</button>
    </> : <div className="stack center" style={{padding:'10px 0'}}>
      <div style={{fontSize:44}}>🏆</div><h2 className="gold" style={{fontSize:'clamp(27px,5vw,39px)',margin:'0'}}>TABRIKLAYMIZ!</h2><h2 className="gold" style={{fontSize:'clamp(24px,4vw,34px)',margin:'0'}}>Siz 50 000 so‘m pul mukofotiga ega bo‘ldingiz!</h2>
      <p className="muted">Quyidagi shartlarni bajaring.</p><div className="notice" style={{textAlign:'left'}}><strong>Siz o‘zingiz bilan do‘stingizni o‘quv kurslarimizga taklif eting. Do‘stingiz kurs tanlab, oylik to‘lovni qilgandan so‘ng Sizga 50 000 so‘m miqdorida pul mukofoti taqdim etiladi.</strong></div>
      <details style={{textAlign:'left',border:'1px solid var(--line)',borderRadius:12,padding:14}}><summary style={{cursor:'pointer',fontWeight:700,color:'var(--gold)'}}>AKSIYA SHARTLARI</summary><ul className="muted"><li>Kanalga obuna bo‘lish shart.</li><li>Do‘stingizni o‘quv kursiga taklif qiling.</li><li>Do‘stingiz kursni tanlab, oylik to‘lovni amalga oshirishi kerak.</li><li>To‘lov administrator tomonidan tasdiqlangandan keyin mukofot beriladi.</li><li>Takroriy yoki soxta referallar mukofotga hisoblanmaydi.</li></ul></details>
    </div>}
    {message && <p className={status==='error'?'error':'muted'} role="status">{message}</p>}
  </section></main>;
}
