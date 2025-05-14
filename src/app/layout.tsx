'use client'

import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'admin-lte/dist/css/adminlte.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Import Bootstrap and AdminLTE scripts
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
    require('admin-lte/dist/js/adminlte.min.js')
  }, [])

  return (
    <html lang="en">
      <body className="hold-transition sidebar-mini layout-fixed">
        <div className="wrapper">
          {children}
        </div>
      </body>
    </html>
  )
}
