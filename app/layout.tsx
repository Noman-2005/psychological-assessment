import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Psychological Assessment Engine',
  description: 'Evidence-based mental health clinical screening utility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}