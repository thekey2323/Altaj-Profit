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
        <div className="flex min-h-screen">
          
          {/* Sidebar (desktop only) */}
          <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-4">
            <div className="font-bold text-lg mb-6">Altaj Leather</div>
            <nav className="space-y-2 text-sm text-slate-600">
              <div className="font-medium text-indigo-600">Dashboard</div>
              <div>Orders</div>
              <div>Products</div>
              <div>Materials</div>
              <div>Ads</div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
