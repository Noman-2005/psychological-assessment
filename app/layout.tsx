import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Psychological Assessment & Diagnostic Suite',
  description: 'Advanced Psychometric & Clinical Pattern Analytics Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}