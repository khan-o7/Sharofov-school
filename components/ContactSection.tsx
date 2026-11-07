export default function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-wrap">
        <div className="contact-head">
          <span className="kicker">Biz bilan bog‘laning</span>
          <h2>SHAROFOV SCHOOL bilan aloqada bo‘ling</h2>
          <p>Savollaringiz bo‘lsa, biz bilan bog‘laning yoki markazimizga tashrif buyuring.</p>
        </div>

        <div className="contact-grid">
          {/* Direct Contacts Card */}
          <div className="contact-card">
            <h3>Murojaat uchun</h3>

            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">☎</span>
              <div>
                <strong>Telefon</strong>
                <br />
                <a href="tel:+998339994343">+998 33 999-43-43</a>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">✈</span>
              <div>
                <strong>Telegram</strong>
                <br />
                <a href="https://t.me/sharofov_school" target="_blank" rel="noopener noreferrer">
                  @sharofov_school
                </a>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">◎</span>
              <div>
                <strong>Instagram</strong>
                <br />
                <a href="https://instagram.com/sharofov_school" target="_blank" rel="noopener noreferrer">
                  @sharofov_school
                </a>
              </div>
            </div>
          </div>

          {/* Location & Hours Card */}
          <div className="contact-card">
            <h3>Bizning manzil</h3>

            <div className="contact-item">
              <span className="contact-icon" aria-hidden="true">⌖</span>
              <div>
                <strong>Toshkent shahri, Uchtepa tumani</strong>
                <br />
                Farhod bozori ro‘parasida, OAZIS binosi, 2-qavat
              </div>
            </div>

            <a
              className="map-link"
              href="https://www.google.com/maps/search/?api=1&query=OAZIS+binosi+Farhod+bozori+Uchtepa+Toshkent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Xaritada ko‘rish</span>
              <span>↗</span>
            </a>

            <div className="contact-item" style={{ marginTop: 20 }}>
              <span className="contact-icon" aria-hidden="true">◷</span>
              <div>
                <strong>Ish vaqti</strong>
                <br />
                <span className="hours-placeholder">Dushanba – Shanba: 08:30 – 19:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

