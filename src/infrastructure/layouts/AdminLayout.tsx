'use client'

import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { TenantProtected } from '../auth';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <TenantProtected>
      <div className="wrapper">
        <Navbar />
        <Sidebar />

        {/* Content */}
        <div className="content-wrapper">
          {children}
        </div>

        {/* Footer */}
        <footer className="main-footer">
          <div className="float-right d-none d-sm-block">
            <b>{t('footer.version')}</b> 1.0.0
          </div>
          <strong>AgileCheckup &copy; 2025</strong> {t('footer.copyright')}.
        </footer>

        {/* Control Sidebar */}
        <aside className="control-sidebar control-sidebar-dark">
          {/* Control sidebar content goes here */}
        </aside>
      </div>
    </TenantProtected>
  );
};

export default AdminLayout;