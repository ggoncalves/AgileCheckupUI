'use client'

import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Script from 'next/script';
import { TenantProvider } from '@/infrastructure/auth';
import { I18nProvider } from '@/infrastructure/i18n';

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Script src="/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/adminlte.min.js" strategy="afterInteractive"/>
    </head>
    <body className="hold-transition sidebar-mini layout-fixed">
    <I18nProvider>
      <TenantProvider>
        {children}
      </TenantProvider>
    </I18nProvider>
    </body>
    </html>
  );
}