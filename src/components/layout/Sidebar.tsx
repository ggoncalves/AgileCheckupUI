'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link href="/" className="brand-link">
        <img src="/img/logo.png" alt="AgileCheckup Logo" className="brand-image img-circle elevation-3" style={{ opacity: 0.8 }} />
        <span className="brand-text font-weight-light">AgileCheckup</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar user panel */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img src="/img/user.png" className="img-circle elevation-2" alt="User Image" />
          </div>
          <div className="info">
            <a href="#" className="d-block">Administrator</a>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            {/* Dashboard */}
            <li className="nav-item">
              <Link href="/" className={`nav-link ${isActive('/')}`}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Companies */}
            {/*<li className="nav-item">*/}
            {/*  <a href="#" className="nav-link">*/}
            {/*    <i className="nav-icon fas fa-building"></i>*/}
            {/*    <p>*/}
            {/*      Companies*/}
            {/*      <i className="fas fa-angle-left right"></i>*/}
            {/*    </p>*/}
            {/*  </a>*/}
            {/*  <ul className="nav nav-treeview">*/}
            {/*    <li className="nav-item">*/}
            {/*      <Link href="/companies" className={`nav-link ${isActive('/companies')}`}>*/}
            {/*        <i className="far fa-circle nav-icon"></i>*/}
            {/*        <p>All Companies</p>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*    <li className="nav-item">*/}
            {/*      <Link href="/companies/add" className={`nav-link ${isActive('/companies/add')}`}>*/}
            {/*        <i className="far fa-circle nav-icon"></i>*/}
            {/*        <p>Add Company</p>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</li>*/}
            <li className="nav-item">
              <Link href="/admin/companies" className="nav-link">
                <i className="nav-icon fas fa-building"></i>
                <p>Companies</p>
              </Link>
            </li>

            {/* Departments */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-sitemap"></i>
                <p>
                  Departments
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/departments" className={`nav-link ${isActive('/departments')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Departments</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/departments/add" className={`nav-link ${isActive('/departments/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Department</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Teams */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-users"></i>
                <p>
                  Teams
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/teams" className={`nav-link ${isActive('/teams')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Teams</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/teams/add" className={`nav-link ${isActive('/teams/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Team</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Performance Cycles */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-calendar-alt"></i>
                <p>
                  Performance Cycles
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/performance-cycles" className={`nav-link ${isActive('/performance-cycles')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Cycles</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/performance-cycles/add" className={`nav-link ${isActive('/performance-cycles/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Cycle</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Assessment Matrices */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-clipboard-check"></i>
                <p>
                  Assessment Matrices
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/matrices" className={`nav-link ${isActive('/matrices')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Matrices</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/matrices/add" className={`nav-link ${isActive('/matrices/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Matrix</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Questions */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-question-circle"></i>
                <p>
                  Questions
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/questions" className={`nav-link ${isActive('/questions')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Questions</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/questions/add" className={`nav-link ${isActive('/questions/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Question</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Employee Assessments */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-user-check"></i>
                <p>
                  Employee Assessments
                  <i className="fas fa-angle-left right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link href="/assessments" className={`nav-link ${isActive('/assessments')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>All Assessments</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/assessments/add" className={`nav-link ${isActive('/assessments/add')}`}>
                    <i className="far fa-circle nav-icon"></i>
                    <p>Add Assessment</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Reports */}
            <li className="nav-item">
              <Link href="/reports" className={`nav-link ${isActive('/reports')}`}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Reports & Analytics</p>
              </Link>
            </li>

            {/* Settings */}
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
                <i className="nav-icon fas fa-cog"></i>
                <p>Settings</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;