export default function CertificateSection() {
  return (
    <section className="certificate" id="certificate">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Yutuqlar e’tirofi</span>
          <h2>O‘quvchilarimiz sertifikatlari</h2>
          <p>Har bir bosib o‘tilgan bosqich — yangi bilim va yangi marralar sari qadam.</p>
        </div>

        <div className="certificate-grid">
          <div>
            <h3>Mehnat natijasi e’tirof etiladi</h3>
            <p>
              Kursni muvaffaqiyatli yakunlagan o‘quvchilarimizga erishgan natijalari va
              o‘zlashtirgan bilimlarini tasdiqlovchi sertifikat taqdim etiladi.
            </p>
          </div>

          <img
            src="/assets/sertifikat.jpeg"
            alt="SHAROFOV SCHOOL kursni tamomlaganlik sertifikati"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
