import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vendora Admin',
  description: 'Panel de administración de Vendora',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#1e293b',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  )
}
