export default function BooksSection() {
  return (
    <section className="books" id="books">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">O‘quv materiallari</span>
          <h2>Bizning maxsus kitoblarimiz</h2>
          <p>SHAROFOV SCHOOL o‘quvchilari uchun tayyorlangan o‘quv qo‘llanmalar.</p>
        </div>

        <div className="book-layout">
          <img
            src="/assets/kitoblar.jpeg"
            alt="SHAROFOV SCHOOL maxsus o‘quv kitoblari"
            loading="lazy"
          />

          <div className="book-copy">
            <h3>O‘rganish uchun maxsus qo‘llanmalar</h3>
            <p>
              O‘quv jarayonini izchil tashkil etish va mavzularni mustahkamlashga yordam beradigan
              maxsus kitoblarimiz.
            </p>

            <div className="tags">
              <span className="tag">English</span>
              <span className="tag">Русский язык</span>
              <span className="tag">Arab tili</span>
              <span className="tag">Pochemuchka</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
