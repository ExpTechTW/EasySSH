import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EasySSH',
  description: 'EasySSH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
          {children}
      </body>
    </html>
  )
}
