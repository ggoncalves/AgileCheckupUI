import React, { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      {/* O sidebar e navbar serão implementados aqui posteriormente */}
      
      {/* Content */}
      <div className="content-wrapper">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="main-footer">
        <div className="float-right d-none d-sm-block">
          <b>Version</b> 1.0.0
        </div>
        <strong>AgileCheckup &copy; 2025</strong> All rights reserved.
      </footer>
    </>
  )
}
