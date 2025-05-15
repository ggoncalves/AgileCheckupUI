'use client'

import React from 'react';
import Link from 'next/link';
import TenantInfo from '../TenantInfo';

const Navbar: React.FC = () => {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link href="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        {/* Tenant info */}
        <TenantInfo />

        {/* Search form */}
        <li className="nav-item">
          <a className="nav-link" data-widget="navbar-search" href="#" role="button">
            <i className="fas fa-search"></i>
          </a>
          <div className="navbar-search-block">
            <form className="form-inline">
              <div className="input-group input-group-sm">
                <input className="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search" />
                <div className="input-group-append">
                  <button className="btn btn-navbar" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                  <button className="btn btn-navbar" type="button" data-widget="navbar-search">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </li>

        {/* Full screen toggle */}
        <li className="nav-item">
          <a className="nav-link" data-widget="fullscreen" href="#" role="button">
            <i className="fas fa-expand-arrows-alt"></i>
          </a>
        </li>

        {/* User dropdown */}
        <li className="nav-item dropdown">
          <a className="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
            <i className="fas fa-user"></i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <span className="dropdown-item dropdown-header">User Menu</span>
            <div className="dropdown-divider"></div>
            <Link href="/profile" className="dropdown-item">
              <i className="fas fa-user-cog mr-2"></i> Profile
            </Link>
            <div className="dropdown-divider"></div>
            <a href="#" className="dropdown-item">
              <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;