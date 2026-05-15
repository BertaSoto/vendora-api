import RegisterForm from '../components/RegisterForm'

export const metadata = {
  title: 'Registrarse — Vendora',
}

export default function RegisterPage() {
  return (
    <main style={styles.main}>
      <RegisterForm />
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
