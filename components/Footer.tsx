export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <a className="brand" href="#home" style={{ color: '#ffffff' }}>
          <i className="wing" aria-hidden="true" />
          <div className="brand-text">
            <span className="brand-title" style={{ color: '#ffffff' }}>SHAROFOV</span>
            <span className="brand-subtitle" style={{ color: '#e9d5ff' }}>SCHOOL</span>
          </div>
        </a>

        <small>© {new Date().getFullYear()} SHAROFOV SCHOOL. Barcha huquqlar himoyalangan.</small>
      </div>
    </footer>
  );
}

