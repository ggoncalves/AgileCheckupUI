'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantProtected from '@/components/TenantProtected';
import AdminLayout from '@/components/layout/AdminLayout';
import { useTenant } from '@/contexts/TenantContext';
import dashboardAnalyticsService, { DashboardAnalyticsOverviewResponse } from '@/services/dashboardAnalyticsService';

const DashboardOverview: React.FC = () => {
  const params = useParams();
  const assessmentMatrixId = params.assessmentMatrixId as string;
  const { companyName } = useTenant();
  
  // Get matrix name from sessionStorage
  const [matrixName, setMatrixName] = useState<string>('');
  const [overviewData, setOverviewData] = useState<DashboardAnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get matrix name from sessionStorage
    const storedName = sessionStorage.getItem(`matrix_${assessmentMatrixId}_name`);
    if (storedName) {
      setMatrixName(storedName);
    }
    
    // Load overview data
    loadOverviewData();
  }, [assessmentMatrixId]);
  
  const loadOverviewData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardAnalyticsService.getDashboardOverview(assessmentMatrixId);
      setOverviewData(data);
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError('Failed to load team comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantProtected>
      <AdminLayout>
          {/* Content Header (Page header) */}
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">Team Performance Overview</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <a href="/dashboard">Dashboard</a>
                    </li>
                    <li className="breadcrumb-item active">Team Comparison</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section className="content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <i className="fas fa-clipboard-check mr-2"></i>
                        {matrixName || 'Assessment Matrix'}
                      </h3>
                      <div className="card-tools">
                        <button type="button" className="btn btn-tool" data-card-widget="collapse">
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      {loading && (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary mb-3" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                          <h5 className="text-muted">Loading Team Comparison</h5>
                          <p className="text-muted">Preparing radar graphs for all teams...</p>
                        </div>
                      )}
                      
                      {error && (
                        <div className="alert alert-danger">
                          <h5><i className="icon fas fa-ban"></i> Error!</h5>
                          {error}
                          <div className="mt-2">
                            <button className="btn btn-outline-danger btn-sm" onClick={loadOverviewData}>
                              <i className="fas fa-redo"></i> Retry
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!loading && !error && overviewData && (
                        <div>
                          {/* Company and Performance Cycle Info */}
                          <div className="row mb-4">
                            <div className="col-12">
                              <div className="alert alert-info">
                                <h6 className="mb-2"><i className="fas fa-building mr-2"></i>{overviewData.metadata.companyName}</h6>
                                <p className="mb-0">
                                  <strong>Performance Cycle:</strong> {overviewData.metadata.performanceCycle}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Team Cards Grid */}
                          <div className="row">
                            {overviewData.teams && overviewData.teams.length > 0 ? (
                              overviewData.teams.map((team, index) => (
                                <div key={team.teamId} className="col-lg-4 col-md-6 mb-4">
                                  <div className="card">
                                    <div className="card-header">
                                      <h5 className="card-title mb-0">{team.teamName}</h5>
                                    </div>
                                    <div className="card-body">
                                      <div className="text-center">
                                        <p className="text-muted">Radar graph will be displayed here</p>
                                        <div className="mt-3">
                                          <div className="row text-center">
                                            <div className="col-6">
                                              <div className="small text-muted">Employees</div>
                                              <div className="font-weight-bold">{team.employeeCount}</div>
                                            </div>
                                            <div className="col-6">
                                              <div className="small text-muted">Score</div>
                                              <div className="font-weight-bold">{team.totalScore}%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-12">
                                <div className="alert alert-warning">
                                  <h5><i className="icon fas fa-exclamation-triangle"></i> No Teams Found</h5>
                                  No teams have been assigned to this assessment matrix yet.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!loading && !error && !overviewData && (
                        <div className="alert alert-warning">
                          <h5><i className="icon fas fa-exclamation-triangle"></i> No Data Available</h5>
                          No data is available for this assessment matrix.
                        </div>
                      )}
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

export default DashboardOverview;