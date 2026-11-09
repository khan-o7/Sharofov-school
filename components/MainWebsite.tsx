'use client';

import { useState } from 'react';
import MainHeader from './MainHeader';
import NextVisual from './NextVisual';
import AboutSection from './AboutSection';
import StatsSection from './StatsSection';
import AdvantagesSection from './AdvantagesSection';
import BooksSection from './BooksSection';
import CertificateSection from './CertificateSection';
import ReviewsSection from './ReviewsSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import BackToTop from './BackToTop';
import ModalLauncher from './ModalLauncher';
import SchoolModal from './SchoolModal';

type MainWebsiteProps = {
  initialModalOpen?: boolean;
  referralCode?: string;
};

export default function MainWebsite({
  initialModalOpen = true,
  referralCode = 'main',
}: MainWebsiteProps) {
  // Modal starts open on visit by default
  const [modalOpen, setModalOpen] = useState(initialModalOpen);

  return (
    <>
      {/* Top sticky navigation bar */}
      <MainHeader onOpenModal={() => setModalOpen(true)} />

      {/* Main page content sections */}
      <main id="main-content">
        <NextVisual />
        <AboutSection />
        <StatsSection />
        <AdvantagesSection />
        <BooksSection />
        <CertificateSection />
        <ReviewsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating to top button */}
      <BackToTop />

      {/* Floating Modal Reopen Launcher Pill */}
      <ModalLauncher onClick={() => setModalOpen(true)} />

      {/* Automatic & Interactive School Modal */}
      <SchoolModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        referralCode={referralCode}
      />
    </>
  );
}
