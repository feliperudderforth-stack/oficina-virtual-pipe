import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Virtual Office | Enterprise Workspace Platform',
  description: 'Real-time collaborative virtual office for remote teams. Video calls, messaging, and immersive workspace experience for up to 2000+ concurrent users.',
  keywords: ['virtual office', 'remote work', 'collaboration', 'video conferencing', 'team workspace'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
