'use client'

import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Script from 'next/script';

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <head>
      {/* Use Next.js Script component for proper script loading */}
      <Script src="/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/adminlte.min.js" strategy="afterInteractive" /><title>Agile Checkup</title>
    </head>
    <body className="hold-transition sidebar-mini layout-fixed">
    {children}
    </body>
    </html>
  );
}