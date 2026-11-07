export default function AdvantagesSection() {
  return (
    <section className="advantages" id="advantages">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Nima uchun biz?</span>
          <h2>Bizning afzalliklarimiz</h2>
          <p>O‘quv jarayonini qulay va samarali qiladigan qo‘shimcha imkoniyatlar.</p>
        </div>

        <div className="cards">
          <article className="card">
            <div className="icon">⌂</div>
            <h3>Co-working zonasi</h3>
            <p>
              O‘quvchilar darsdan tashqari vaqtda mustaqil shug‘ullanishi, uy vazifalarini bajarishi
              va tinch muhitda bilim olishi mumkin.
            </p>
          </article>

          <article className="card">
            <div className="icon">✦</div>
            <h3>Qo‘shimcha o‘qituvchi</h3>
            <p>
              Co-working zonasida qo‘shimcha o‘qituvchi faoliyat yuritadi. Mavzuga tushunmasangiz yoki
              savolingiz bo‘lsa, u sizga yordam beradi va mavzuni qayta tushuntiradi.
            </p>
          </article>

          <article className="card">
            <div className="icon">✓</div>
            <h3>Oylik imtihonlar</h3>
            <p>
              Har oy o‘tilgan mavzular bo‘yicha test, yozma topshiriqlar, savol-javob va og‘zaki
              suhbatlar orqali bilimlar tekshiriladi. Natijalar bilimdagi bo‘shliqlarni aniqlash va
              rivojlanishni kuzatishga yordam beradi.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

