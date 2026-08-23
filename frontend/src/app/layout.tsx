import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CareerPulse AI | AI Job Application Tracker & Interview Prep',
  description: 'Production-quality AI Job Application Tracker powered by Gemini AI, Spring Boot REST API, and WSO2 API Platform Cloud.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-sky-500 selection:text-white`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
