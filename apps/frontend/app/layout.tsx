import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
