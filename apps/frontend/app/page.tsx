export default function HomePage() {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Vendora Frontend</h1>
        <p style={styles.subtitle}>
          Panel de administración listo para desarrollo.
        </p>
        <div style={styles.links}>
          <a href="/api/auth/health" style={styles.link}>
            Auth Service
          </a>
          <a href="/api/stores/health" style={styles.link}>
            Store Service
          </a>
          <a href="/api/products/health" style={styles.link}>
            Product Service
          </a>
          <a href="/api/orders/health" style={styles.link}>
            Order Service
          </a>
          <a href="/api/dashboard/health" style={styles.link}>
            BFF Service
          </a>
        </div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    marginBottom: '32px',
    fontSize: '1rem',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  link: {
    display: 'block',
    padding: '8px 20px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    width: '220px',
  },
}
