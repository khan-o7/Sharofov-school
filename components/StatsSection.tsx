export default function StatsSection() {
  return (
    <section className="stats" id="stats">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Natijalarimiz</span>
          <h2>O‘quv markaz statistikasi</h2>
          <p>Birgalikdagi mehnatimiz va o‘quvchilarimiz natijalari.</p>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <b>1000+</b>
            <span>Bitiruvchilar</span>
          </div>
          <div className="stat">
            <b>95%</b>
            <span>O‘zlashtirgan o‘quvchilar</span>
          </div>
          <div className="stat">
            <b>97+</b>
            <span>Imtihondan jamlagan ball</span>
          </div>
        </div>
      </div>
    </section>
  );
}

