import LoginForm from '../components/LoginForm'

export const metadata = {
  title: 'Iniciar sesión — Vendora',
}

export default function LoginPage() {
  return (
    <main style={styles.main}>
      <LoginForm />
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
    padding: '24px',
  },
}
