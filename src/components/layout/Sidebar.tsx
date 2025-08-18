'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link href="/" className="brand-link">
        <Image src="/img/logo.png" alt="AgileCheckup Logo" width={32} height={32} className="brand-image img-circle elevation-3" style={{ opacity: 0.8 }} />
        <span className="brand-text font-weight-light">AgileCheckup</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar user panel */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <Image src="/img/user.png" width={40} height={40} className="img-circle elevation-2" alt="User Image" />
          </div>
          <div className="info">
            <a href="#" className="d-block">Administrator</a>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            {/* Home */}
            <li className="nav-item">
              <Link href="/home" className={`nav-link ${isActive('/home')}`}>
                <i className="nav-icon fas fa-home"></i>
                <p>{t('navigation.home')}</p>
              </Link>
            </li>

            {/* Companies */}
            <li className="nav-item">
              <Link href="/admin/companies" className="nav-link">
                <i className="nav-icon fas fa-building"></i>
                <p>{t('navigation.companies')}</p>
              </Link>
            </li>

            {/* Departments */}
            <li className="nav-item">
              <Link href="/departments" className="nav-link">
                <i className="nav-icon fas fa-sitemap"></i>
                <p>{t('navigation.departments')}</p>
              </Link>
            </li>

            {/* Teams */}
            <li className="nav-item">
              <Link href="/teams" className="nav-link">
                <i className="nav-icon fas fa-users"></i>
                <p>{t('navigation.teams')}</p>
              </Link>
            </li>

            {/* Performance Cycles */}
            <li className="nav-item">
              <Link href="/performancecycles" className="nav-link">
                <i className="nav-icon fas fa-sync-alt"></i>
                <p>{t('navigation.performanceCycles')}</p>
              </Link>
            </li>

            {/* Assessment Matrices */}
            <li className="nav-item">
              <Link href="/assessmentmatrices" className={`nav-link ${isActive('/assessmentmatrices')}`}>
                <i className="nav-icon fas fa-clipboard-check"></i>
                <p>{t('navigation.assessmentMatrices')}</p>
              </Link>
            </li>

            {/* Questions */}
            <li className="nav-item">
              <Link href="/questions" className={`nav-link ${isActive('/questions')}`}>
                <i className="nav-icon fas fa-question-circle"></i>
                <p>{t('navigation.questions')}</p>
              </Link>
            </li>

            {/* Employee Assessments */}
            <li className="nav-item">
              <Link href="/employeeassessments" className={`nav-link ${isActive('/employeeassessments')}`}>
                <i className="nav-icon fas fa-user-check"></i>
                <p>{t('navigation.employeeAssessments')}</p>
              </Link>
            </li>

            {/* Dashboard */}
            <li className="nav-item">
              <Link href="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>{t('navigation.dashboard')}</p>
              </Link>
            </li>

            {/* Settings - Using d-none temporary while there are no configuration options */}
            <li className="nav-item d-none">
              <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
                <i className="nav-icon fas fa-cog"></i>
                <p>{t('navigation.settings')}</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
