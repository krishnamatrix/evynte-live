import type { Metadata, Viewport } from 'next';
import ClientTemplate from '@/components/ClientTemplate';
import { EventProvider } from '@/contexts/EventContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Evynte - Event Management App',
  description: 'AI-powered event chat application',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0c29',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f0c29" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <div className="app">
          <EventProvider>
            <ClientTemplate>{children}</ClientTemplate>
          </EventProvider>
        </div>
      </body>
    </html>
  );
}
