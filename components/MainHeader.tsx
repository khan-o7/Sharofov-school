'use client';

import { useState } from 'react';

type MainHeaderProps = {
  onOpenModal: () => void;
};

export default function MainHeader({ onOpenModal }: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar">
      <div className="wrap nav">
        {/* Brand */}
        <a className="brand" href="#home" onClick={handleNavClick}>
          <i className="wing" aria-hidden="true" />
          <div className="brand-text">
            <span className="brand-title">SHAROFOV</span>
            <span className="brand-subtitle">SCHOOL</span>
          </div>
        </a>

        {/* Desktop & Mobile Navigation Links */}
        <nav
          className={`links ${mobileMenuOpen ? 'open' : ''}`}
          id="navlinks"
          aria-label="Asosiy menyu"
        >
          <a href="#home" onClick={handleNavClick}>Bosh sahifa</a>
          <a href="#about" onClick={handleNavClick}>Biz haqimizda</a>
          <a href="#stats" onClick={handleNavClick}>Statistika</a>
          <a href="#advantages" onClick={handleNavClick}>Afzalliklar</a>
          <a href="#books" onClick={handleNavClick}>Kitoblar</a>
          <a href="#certificate" onClick={handleNavClick}>Sertifikat</a>
          <a href="#reviews" onClick={handleNavClick}>Fikrlar</a>
          <a href="#contact" onClick={handleNavClick}>Aloqa</a>
          
          {mobileMenuOpen && (
            <button
              type="button"
              className="btn-nav-promo"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenModal();
              }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              <span>🎁</span>
              <span>50 000 so‘m Aksiya</span>
            </button>
          )}
        </nav>

        {/* Action Button & Hamburger Menu */}
        <div className="nav-actions">
          <button
            type="button"
            className="btn-nav-promo"
            onClick={onOpenModal}
            title="50 000 so‘m pul mukofoti aksiyasida qatnashish"
          >
            <span>🎁</span>
            <span>Aksiya (50 000 so‘m)</span>
          </button>

          <button
            type="button"
            className="menu"
            aria-label="Menyuni ochish"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}

