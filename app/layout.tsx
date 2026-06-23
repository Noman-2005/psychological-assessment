import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mental Health & Personality Assessment',
  description: 'A premium psychological screening and personality assessment tool.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn">
      <body className="antialiased bg-[#0b1120] text-slate-200 font-sans">
        {children}
      </body>
    </html>
  )
}