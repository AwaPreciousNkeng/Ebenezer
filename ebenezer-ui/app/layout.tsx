import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import QueryProvider from '@/components/shared/QueryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ebenezer — Trading Journal',
  description: 'Log, analyze, and improve your trading performance',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
            richColors
            position="top-right"
            theme="dark"
        />
      </ThemeProvider>
      </body>
      </html>
  );
}