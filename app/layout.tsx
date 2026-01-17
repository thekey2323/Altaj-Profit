import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Altaj Leather',
  description: 'Accounting tool for handmade leather businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
