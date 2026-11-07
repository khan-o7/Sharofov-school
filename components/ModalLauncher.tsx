'use client';

type ModalLauncherProps = {
  onClick: () => void;
};

export default function ModalLauncher({ onClick }: ModalLauncherProps) {
  return (
    <button
      type="button"
      className="promo-launcher-pill"
      onClick={onClick}
      title="50 000 so‘m yutuq aksiyasini ochish"
      aria-label="50 000 so‘m yutuq aksiyasini ochish"
    >
      <span className="pulse-dot" aria-hidden="true" />
      <span style={{ fontSize: 18 }} role="img" aria-label="sovg‘a">🎁</span>
      <span style={{ color: '#fbbf24', letterSpacing: '0.02em' }}>
        50 000 so‘m Aksiya & Mukofot
      </span>
    </button>
  );
}

