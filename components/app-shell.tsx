export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand-wordmark">Macanudas</div>
        <p className="tagline">Frequent customer loyalty card</p>
      </header>
      <div className="stripe" />
      {children}
      <p className="footer-note">Macanudas Empanadas Argentinas · Loyalty Program</p>
    </main>
  );
}
