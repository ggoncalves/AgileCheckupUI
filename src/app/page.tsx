'use client'

import AdminLayout from '@/components/layout/AdminLayout';
import React from 'react';

export default function Home() {
  return (
    <AdminLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="info-box">
                <span className="info-box-icon bg-info elevation-1"><i className="fas fa-building"></i></span>
                <div className="info-box-content">
                  <span className="info-box-text">Companies</span>
                  <span className="info-box-number">10</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <div className="info-box">
                <span className="info-box-icon bg-success elevation-1"><i className="fas fa-users"></i></span>
                <div className="info-box-content">
                  <span className="info-box-text">Teams</span>
                  <span className="info-box-number">41</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <div className="info-box">
                <span className="info-box-icon bg-warning elevation-1"><i className="fas fa-clipboard-check"></i></span>
                <div className="info-box-content">
                  <span className="info-box-text">Assessments</span>
                  <span className="info-box-number">25</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <div className="info-box">
                <span className="info-box-icon bg-danger elevation-1"><i className="fas fa-question-circle"></i></span>
                <div className="info-box-content">
                  <span className="info-box-text">Questions</span>
                  <span className="info-box-number">93</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Row */}
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Assessments</h3>
                </div>
                <div className="card-body">
                  <p>Welcome to the AgileCheckup Admin Dashboard!</p>
                  <p>This is the base project using Next.js, AdminLTE 3.2, and Bootstrap 5.</p>
                  <p>Assessment data will be displayed here.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Stats</h3>
                </div>
                <div className="card-body">
                  <p>Performance metrics and statistics will be displayed here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}