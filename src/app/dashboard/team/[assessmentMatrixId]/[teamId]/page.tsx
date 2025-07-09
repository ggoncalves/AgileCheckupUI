'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TenantProtected } from '@/infrastructure/auth';
import { AdminLayout } from '@/infrastructure/layouts';
import { useTenant } from '@/infrastructure/auth';
import dashboardAnalyticsService, { DashboardAnalyticsTeamResponse } from '@/services/dashboardAnalyticsService';
import RadarChart from '@/components/charts/RadarChart';
import { transformCategoriesToChartData } from '@/utils/chartUtils';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import { DASHBOARD_COLORS } from '@/styles/dashboardColors';

const TeamDetail: React.FC = () => {
  const params = useParams();
  const assessmentMatrixId = params.assessmentMatrixId as string;
  const teamId = params.teamId as string;
  const { } = useTenant();
  
  // State management
  const [teamData, setTeamData] = useState<DashboardAnalyticsTeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matrixName, setMatrixName] = useState<string>('');
  
  // Load team analytics data
  const loadTeamData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardAnalyticsService.getTeamAnalytics(assessmentMatrixId, teamId);
      setTeamData(data);
    } catch (err) {
      console.error('Error loading team data:', err);
      setError('Failed to load team analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [assessmentMatrixId, teamId]);
  
  useEffect(() => {
    // Get matrix name from sessionStorage
    const storedName = sessionStorage.getItem(`matrix_${assessmentMatrixId}_name`);
    if (storedName) {
      setMatrixName(storedName);
    }
    
    // Load team data
    loadTeamData();
  }, [assessmentMatrixId, teamId, loadTeamData]);

  return (
    <TenantProtected>
      <AdminLayout>
          {/* Content Header (Page header) */}
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">Team Performance Detail</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <a href="/dashboard">Dashboard</a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href={`/dashboard/overview/${assessmentMatrixId}`}>{matrixName || 'Team Comparison'}</a>
                    </li>
                    <li className="breadcrumb-item active">
                      {teamData?.teamName || `Team ${teamId}`}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section className="content">
            <div className="container-fluid">
              
              {/* Loading State */}
              {loading && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <h5 className="text-muted">Loading Team Analytics</h5>
                        <p className="text-muted">Preparing detailed performance analysis...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-danger">
                      <h5><i className="icon fas fa-ban"></i> Error!</h5>
                      {error}
                      <div className="mt-2">
                        <button className="btn btn-outline-danger btn-sm" onClick={loadTeamData}>
                          <i className="fas fa-redo"></i> Retry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Data Loaded */}
              {!loading && !error && teamData && (
                <>
                  {/* Team Overview Cards */}
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="info-box">
                        <span className="info-box-icon bg-info elevation-1">
                          <i className="fas fa-users"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Team Members</span>
                          <span className="info-box-number">{teamData.employeeCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="info-box">
                        <span className="info-box-icon bg-success elevation-1">
                          <i className="fas fa-chart-line"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Overall Score</span>
                          <span className="info-box-number">{teamData.totalScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="info-box">
                        <span className="info-box-icon bg-warning elevation-1">
                          <i className="fas fa-tasks"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Completion</span>
                          <span className="info-box-number">{teamData.completionPercentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="info-box">
                        <span className="info-box-icon bg-danger elevation-1">
                          <i className="fas fa-layer-group"></i>
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Pillars</span>
                          <span className="info-box-number">{Object.keys(teamData.pillarScores || {}).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Pillar Analysis */}
                  <div className="row mb-4">
                    {teamData.pillarScores && Object.keys(teamData.pillarScores).length > 0 ? (
                      Object.entries(teamData.pillarScores).map(([pillarKey, pillar], pillarIndex) => (
                        <div key={pillarKey} className="col-lg-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                <i className="fas fa-layer-group mr-2"></i>
                                {pillar.name}
                              </h3>
                              <div className="card-tools">
                                <span className="badge badge-primary">
                                  {Math.round(pillar.score)}%
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              {/* Pillar Overview Stats */}
                              <div className="row mb-3">
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="small text-muted">Categories</div>
                                    <div className="font-weight-bold">{pillar.categories?.length || 0}</div>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="small text-muted">Actual</div>
                                    <div className="font-weight-bold">{pillar.actualScore}</div>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="small text-muted">Potential</div>
                                    <div className="font-weight-bold">{pillar.potentialScore}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Gap Warning */}
                              {pillar.gapFromPotential > 0 && (
                                <div className="alert alert-warning py-2 mb-3">
                                  <small>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    Gap from potential: {Math.round(pillar.gapFromPotential)}%
                                  </small>
                                </div>
                              )}

                              {/* Category Visualization */}
                              {pillar.categories && pillar.categories.length > 0 ? (
                                pillar.categories.length >= 3 ? (
                                  // Radar Chart for 3+ categories
                                  <RadarChart
                                    entities={[{
                                      entityId: `${teamData.teamId}-${pillarKey}`,
                                      entityName: pillar.name,
                                      data: transformCategoriesToChartData(pillar.categories),
                                      color: DASHBOARD_COLORS.radar.primary[pillarIndex % DASHBOARD_COLORS.radar.primary.length]
                                    }]}
                                    height={280}
                                    showLegend={false}
                                    animate={true}
                                  />
                                ) : (
                                  // Bar Chart for <3 categories
                                  <CategoryBarChart
                                    categories={pillar.categories}
                                    color={DASHBOARD_COLORS.radar.primary[pillarIndex % DASHBOARD_COLORS.radar.primary.length]}
                                    height={280}
                                  />
                                )
                              ) : (
                                <div className="text-center py-4">
                                  <i className="fas fa-exclamation-circle text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                  <p className="text-muted mb-0">No category data available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="card">
                          <div className="card-body text-center py-5">
                            <i className="fas fa-layer-group text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="text-muted">No Pillar Data Available</h5>
                            <p className="text-muted">This team hasn&apos;t completed enough assessments to generate pillar analysis.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Word Cloud Section */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-cloud mr-2"></i>
                            Team Feedback Word Cloud
                          </h3>
                        </div>
                        <div className="card-body">
                          {teamData.wordCloud && teamData.wordCloud.words && teamData.wordCloud.words.length > 0 ? (
                            <div className="text-center py-4">
                              <p className="text-info mb-3">
                                <i className="fas fa-info-circle mr-1"></i>
                                Generated from {teamData.wordCloud.totalWords} feedback responses
                              </p>
                              {/* Simple word cloud representation */}
                              <div className="word-cloud-container">
                                {teamData.wordCloud.words.slice(0, 20).map((word, index) => (
                                  <span
                                    key={index}
                                    className="badge badge-light mr-2 mb-2"
                                    style={{
                                      fontSize: `${Math.max(12, Math.min(24, word.count * 2))}px`,
                                      color: DASHBOARD_COLORS.wordCloud[index % DASHBOARD_COLORS.wordCloud.length],
                                      borderColor: DASHBOARD_COLORS.wordCloud[index % DASHBOARD_COLORS.wordCloud.length]
                                    }}
                                  >
                                    {word.text} ({word.count})
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <i className="fas fa-cloud text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                              <h5 className="text-muted">No Feedback Data Available</h5>
                              <p className="text-muted">No text feedback has been collected for this team yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* No Data State */}
              {!loading && !error && !teamData && (
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-warning">
                      <h5><i className="icon fas fa-exclamation-triangle"></i> No Data Available</h5>
                      No analytics data is available for this team and assessment matrix combination.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>
      </AdminLayout>
    </TenantProtected>
  );
};

export default TeamDetail;