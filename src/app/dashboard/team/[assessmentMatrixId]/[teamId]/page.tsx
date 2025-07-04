'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TenantProtected from '@/components/TenantProtected';
import AdminLayout from '@/components/layout/AdminLayout';

const TeamDetail: React.FC = () => {
  const params = useParams();
  const assessmentMatrixId = params.assessmentMatrixId as string;
  const teamId = params.teamId as string;

  return (
    <TenantProtected>
      <AdminLayout>
          {/* Content Header (Page header) */}
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">Team Analytics Detail</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <a href="/dashboard">Dashboard</a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href={`/dashboard/overview/${assessmentMatrixId}`}>Team Comparison</a>
                    </li>
                    <li className="breadcrumb-item active">Team Detail</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section className="content">
            <div className="container-fluid">
              {/* Team Overview Card */}
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        Team: {teamId}
                      </h3>
                      <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse">
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <h5 className="text-muted">Loading Team Analytics</h5>
                        <p className="text-muted">Preparing detailed pillar analysis and word cloud...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar Analytics Section - Placeholder */}
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Pillar Performance Analysis</h3>
                    </div>
                    <div className="card-body">
                      <p className="text-muted">Pillar radar graphs will be displayed here...</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Word Cloud Section - Placeholder */}
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Team Feedback Word Cloud</h3>
                    </div>
                    <div className="card-body">
                      <p className="text-muted">Word cloud visualization will be displayed here...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
      </AdminLayout>
    </TenantProtected>
  );
};

export default TeamDetail;