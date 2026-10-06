import type { Metadata } from 'next';
import './globals.css';
import AppHeader from './components/AppHeader';

export const metadata: Metadata = {
  title: 'LeadAgent7 | Enterprise Intelligence & Marketing CRM',
  description: 'Enterprise AI Marketing, WhatsApp Broadcasts, CRM Pipeline & CSV Lead Gen Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FA] text-slate-800 antialiased flex flex-col font-sans selection:bg-[#714B67] selection:text-white">
        <AppHeader />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
