import type { Metadata } from 'next';
import ClientTemplate from '../components/ClientTemplate';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Evynte - Event Management App',
  description: 'AI-powered event chat application',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  themeColor: '#0f0c29',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <ClientTemplate>{children}</ClientTemplate>
        </div>
      </body>
    </html>
  );
}
