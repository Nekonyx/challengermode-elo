import { Metadata } from 'next'
import type { ReactNode } from 'react'
import { fontMono, fontSans } from '@/configs/font'
import './globals.css'
import { QueryProvider } from '@/components/containers/query-provider'

export const metadata: Metadata = {
  title: 'CS2 Challengermode Roster ELO',
  description: ''
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru-RU"
      className={`${fontSans.variable} ${fontMono.variable} antialiased dark`}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
