import './globals.css';

export const metadata = {
  title: 'Mental Health & Personality Assessment',
  description: 'A comprehensive screening and Mini-IPIP personality mapping tool.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0b1120]">
        {children}
      </body>
    </html>
  );
}