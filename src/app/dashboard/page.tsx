'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/infrastructure/auth';
import { TenantProtected } from '@/infrastructure/auth';
import { AdminLayout } from '@/infrastructure/layouts';
import dashboardAnalyticsService, { 
  DashboardResponse 
} from '@/services/dashboardAnalyticsService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { assessmentMatrixService, AssessmentMatrix } from '@/services/assessmentMatrixService';
import { getMatrixCardColor } from '@/styles/dashboardColors';

const Dashboard: React.FC = () => {
  // Hooks
  const router = useRouter();
  const { t } = useTranslation();
  const { tenantId, companyName } = useTenant();
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [assessmentMatrices, setAssessmentMatrices] = useState<AssessmentMatrix[]>([]);
  const [matrixDashboards, setMatrixDashboards] = useState<Map<string, DashboardResponse>>(new Map());
  
  // Loading states
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [loadingDashboards, setLoadingDashboards] = useState<Set<string>>(new Set());
  
  // Error states
  const [cyclesError, setCyclesError] = useState<string | null>(null);
  const [matricesError, setMatricesError] = useState<string | null>(null);

  // Step 1: Load Performance Cycles
  const loadPerformanceCycles = useCallback(async () => {
    if (!tenantId) return;
    
    setLoadingCycles(true);
    setCyclesError(null);
    
    try {
      const cycles = await performanceCycleService.getAll();
      // Filter for active cycles only using the correct field
      const activeCycles = cycles.filter(cycle => cycle.isActive);
      setPerformanceCycles(activeCycles);
    } catch (error) {
      console.error('Error loading performance cycles:', error);
      setCyclesError(t('dashboard.errors.loadCyclesFailed'));
    } finally {
      setLoadingCycles(false);
    }
  }, [tenantId, t]);

  // Step 2: Load Assessment Matrices
  const loadAssessmentMatrices = useCallback(async () => {
    if (!tenantId) return;
    
    setLoadingMatrices(true);
    setMatricesError(null);
    
    try {
      const matrices = await assessmentMatrixService.getAll();
      setAssessmentMatrices(matrices);
    } catch (error) {
      console.error('Error loading assessment matrices:', error);
      setMatricesError(t('dashboard.errors.loadMatricesFailed'));
    } finally {
      setLoadingMatrices(false);
    }
  }, [tenantId, t]);

  // Step 3: Load Dashboard Data for a specific matrix  
  const loadMatrixDashboard = useCallback(async (matrixId: string) => {
    if (matrixDashboards.has(matrixId)) return; // Already loaded
    
    setLoadingDashboards(prev => new Set(prev).add(matrixId));
    
    try {
      const dashboardData = await dashboardAnalyticsService.getAssessmentMatrixDashboard(matrixId);
      setMatrixDashboards(prev => new Map(prev).set(matrixId, dashboardData));
    } catch (error) {
      console.error(`Error loading dashboard for matrix ${matrixId}:`, error);
      // Don't show error for individual matrices - just log it
    } finally {
      setLoadingDashboards(prev => {
        const newSet = new Set(prev);
        newSet.delete(matrixId);
        return newSet;
      });
    }
  }, [matrixDashboards]);

  // Load data incrementally when component mounts or tenantId changes
  useEffect(() => {
    if (tenantId) {
      loadPerformanceCycles();
      loadAssessmentMatrices();
    }
  }, [tenantId, loadPerformanceCycles, loadAssessmentMatrices]);

  // Load dashboard data for each assessment matrix
  useEffect(() => {
    assessmentMatrices.forEach(matrix => {
      loadMatrixDashboard(matrix.id);
    });
  }, [assessmentMatrices, loadMatrixDashboard]);

  // Retry functions
  const retryLoadCycles = () => {
    loadPerformanceCycles();
  };

  const retryLoadMatrices = () => {
    loadAssessmentMatrices();
  };

  // Group Assessment Matrices by Performance Cycle
  const groupMatricesByCycle = () => {
    const groups = new Map<string, {
      cycle: PerformanceCycle;
      matrices: AssessmentMatrix[];
    }>();

    // First, create groups for all active performance cycles
    performanceCycles.forEach(cycle => {
      groups.set(cycle.id, {
        cycle,
        matrices: []
      });
    });

    // Then, add assessment matrices to their respective cycles
    assessmentMatrices.forEach(matrix => {
      if (groups.has(matrix.performanceCycleId)) {
        groups.get(matrix.performanceCycleId)!.matrices.push(matrix);
      }
    });

    // Convert to array and sort by cycle name
    return Array.from(groups.values())
      .filter(group => group.matrices.length > 0) // Only show cycles with matrices
      .sort((a, b) => a.cycle.name.localeCompare(b.cycle.name));
  };

  const cycleGroups = groupMatricesByCycle();

  // Navigation function
  const navigateToOverview = (assessmentMatrixId: string, matrixName: string) => {
    // Store matrix name in sessionStorage for breadcrumb display
    sessionStorage.setItem(`matrix_${assessmentMatrixId}_name`, matrixName);
    router.push(`/dashboard/overview/${assessmentMatrixId}`);
  };

  return (
    <TenantProtected>
      <AdminLayout>
          {/* Content Header (Page header) */}
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">{t('dashboard.title')}</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item active">{t('dashboard.title')}</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section className="content">
            <div className="container-fluid">
              
              {/* Company Info Header */}
              <div className="row mb-3">
                <div className="col-12">
                  <div className="alert alert-info">
                    <h5><i className="icon fas fa-building"></i> {companyName}</h5>
                    <p className="mb-0">{t('dashboard.description')}</p>
                  </div>
                </div>
              </div>

              {/* Loading Performance Cycles */}
              {loadingCycles && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body text-center py-4">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="sr-only">{t('common.status.loading')}</span>
                        </div>
                        <h6 className="text-muted">{t('dashboard.loading.performanceCycles')}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Cycles Error */}
              {cyclesError && (
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-danger alert-dismissible">
                      <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                      <h5><i className="icon fas fa-ban"></i> {t('common.status.error')}!</h5>
                      {cyclesError}
                      <div className="mt-2">
                        <button className="btn btn-outline-danger btn-sm" onClick={retryLoadCycles}>
                          <i className="fas fa-redo"></i> {t('dashboard.buttons.retry')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Assessment Matrices */}
              {loadingMatrices && !loadingCycles && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body text-center py-4">
                        <div className="spinner-border text-secondary mb-3" role="status">
                          <span className="sr-only">{t('common.status.loading')}</span>
                        </div>
                        <h6 className="text-muted">{t('dashboard.loading.assessmentMatrices')}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Matrices Error */}
              {matricesError && (
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-warning alert-dismissible">
                      <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                      <h5><i className="icon fas fa-exclamation-triangle"></i> {t('dashboard.status.warning')}!</h5>
                      {matricesError}
                      <div className="mt-2">
                        <button className="btn btn-outline-warning btn-sm" onClick={retryLoadMatrices}>
                          <i className="fas fa-redo"></i> {t('dashboard.buttons.retry')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Cycle Sections */}
              {!loadingCycles && !cyclesError && cycleGroups.length > 0 && cycleGroups.map(group => (
                <div key={group.cycle.id} className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">
                          <i className="fas fa-sync-alt mr-2"></i>
                          {group.cycle.name}
                        </h3>
                        <div className="card-tools">
                          <span className="badge badge-primary">
                            {t('dashboard.matrix.count', { count: group.matrices.length })}
                          </span>
                          <span className="badge badge-secondary ml-2">
                            {group.cycle.isActive ? t('dashboard.status.active') : t('dashboard.status.inactive')}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        {/* Performance Cycle Description */}
                        {group.cycle.description && (
                          <div className="alert alert-light mb-3">
                            <p className="mb-0">{group.cycle.description}</p>
                          </div>
                        )}

                        {/* Cycle Dates Info */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-calendar-alt mr-1"></i>
                              <strong>{t('dashboard.dates.startDate')}:</strong> {group.cycle.startDate ? new Date(group.cycle.startDate).toLocaleDateString() : t('dashboard.dates.notSet')}
                            </small>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-calendar-check mr-1"></i>
                              <strong>{t('dashboard.dates.endDate')}:</strong> {group.cycle.endDate ? new Date(group.cycle.endDate).toLocaleDateString() : t('dashboard.dates.notSet')}
                            </small>
                          </div>
                        </div>

                        {/* Assessment Matrix Cards Grid */}
                        <div className="row">
                          {group.matrices.map(matrix => {
                            // Get dashboard data and calculate colors
                            const dashboardData = matrixDashboards.get(matrix.id);
                            const completedAssessments = dashboardData?.completedAssessments || 0;
                            const totalEmployees = dashboardData?.totalEmployees || 0;
                            const completionPercentage = totalEmployees > 0 
                              ? Math.round((completedAssessments / totalEmployees) * 100)
                              : 0;
                            
                            // Get color scheme based on completion (only if we have data)
                            const cardColors = dashboardData 
                              ? getMatrixCardColor(completedAssessments, totalEmployees)
                              : null;

                            // Determine status badge
                            const getStatusBadge = () => {
                              if (!dashboardData) return { text: t('common.status.loading'), class: 'badge-secondary' };
                              if (completionPercentage >= 100) return { text: t('dashboard.status.completed'), class: 'badge-success' };
                              if (completionPercentage >= 50) return { text: t('dashboard.status.goodProgress'), class: 'badge-primary' };
                              if (completionPercentage > 0) return { text: t('dashboard.status.needsAttention'), class: 'badge-warning' };
                              return { text: t('dashboard.status.notStarted'), class: 'badge-light' };
                            };

                            const statusBadge = getStatusBadge();

                            return (
                              <div key={matrix.id} className="col-lg-4 col-md-6 col-sm-12 mb-3">
                                <div 
                                  className="card h-100"
                                  style={{
                                    borderLeft: cardColors ? `4px solid ${cardColors.border}` : '4px solid #dee2e6',
                                    backgroundColor: cardColors ? cardColors.background : 'white',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '';
                                  }}
                                >
                                  <div className="card-header bg-transparent border-0 pb-0">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <h5 className="card-title mb-0" style={{ color: cardColors?.text || '#495057' }}>
                                        <i className="fas fa-clipboard-check mr-2"></i>
                                        {matrix.name}
                                      </h5>
                                      <span className={`badge ${statusBadge.class}`}>
                                        {statusBadge.text}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="card-body pt-2">
                                    {/* Matrix Description */}
                                    {matrix.description && (
                                      <p className="text-muted small mb-3">{matrix.description}</p>
                                    )}

                                    {/* Loading state for this matrix */}
                                    {loadingDashboards.has(matrix.id) && (
                                      <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                          <span className="sr-only">{t('common.status.loading')}</span>
                                        </div>
                                        <div className="small text-muted mt-2">{t('dashboard.loading.completionData')}</div>
                                      </div>
                                    )}

                                    {/* Dashboard data loaded - show detailed info */}
                                    {!loadingDashboards.has(matrix.id) && dashboardData && (
                                      <>
                                        {/* Progress Section */}
                                        <div className="mb-3">
                                          <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="small text-muted">{t('dashboard.progress.completionProgress')}:</span>
                                            <span className="font-weight-bold" style={{ color: cardColors?.text }}>
                                              {completionPercentage}%
                                            </span>
                                          </div>
                                          <div className="progress mb-2" style={{ height: '10px' }}>
                                            <div 
                                              className="progress-bar" 
                                              style={{ 
                                                width: `${completionPercentage}%`,
                                                backgroundColor: cardColors?.badge || '#007bff'
                                              }}
                                            ></div>
                                          </div>
                                          <div className="small text-muted">
                                            <i className="fas fa-users mr-1"></i>
                                            {t('dashboard.progress.employeesCompleted', { completed: completedAssessments, total: totalEmployees })}
                                          </div>
                                        </div>

                                        {/* Team Summary */}
                                        <div className="mb-3">
                                          <div className="row text-center">
                                            <div className="col-6">
                                              <div className="small text-muted">{t('dashboard.summary.teams')}</div>
                                              <div className="font-weight-bold">{dashboardData.teamSummaries?.length || 0}</div>
                                            </div>
                                            <div className="col-6">
                                              <div className="small text-muted">{t('dashboard.summary.questions')}</div>
                                              <div className="font-weight-bold">{matrix.questionCount || t('dashboard.summary.notAvailable')}</div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                          <button 
                                            className="btn btn-block"
                                            style={{
                                              backgroundColor: cardColors?.badge || '#007bff',
                                              borderColor: cardColors?.badge || '#007bff',
                                              color: 'white'
                                            }}
                                            onClick={() => navigateToOverview(matrix.id, matrix.name)}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.opacity = '0.9';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.opacity = '1';
                                            }}
                                          >
                                            <i className="fas fa-chart-bar mr-2"></i>
                                            {t('dashboard.buttons.viewTeamAnalytics')}
                                          </button>
                                        </div>
                                      </>
                                    )}

                                    {/* No dashboard data available */}
                                    {!loadingDashboards.has(matrix.id) && !dashboardData && (
                                      <div className="text-center py-4">
                                        <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                                        <div className="text-muted">{t('dashboard.messages.noCompletionData')}</div>
                                        <div className="small text-muted mt-2">
                                          {t('dashboard.messages.assessmentNotStarted')}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state - No Performance Cycles with Assessment Matrices */}
              {!loadingCycles && !cyclesError && cycleGroups.length === 0 && performanceCycles.length > 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <div className="mb-4">
                          <i className="fas fa-clipboard-list text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="text-muted">{t('dashboard.emptyState.noMatrices.title')}</h4>
                        <p className="text-muted mb-4">
                          {t('dashboard.emptyState.noMatrices.description', { count: performanceCycles.length })}
                        </p>
                        <a href="/assessmentmatrices" className="btn btn-primary">
                          <i className="fas fa-plus mr-2"></i>
                          {t('dashboard.emptyState.noMatrices.button')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state - No Performance Cycles at all */}
              {!loadingCycles && !cyclesError && performanceCycles.length === 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <div className="mb-4">
                          <i className="fas fa-chart-bar text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="text-muted">{t('dashboard.emptyState.noCycles.title')}</h4>
                        <p className="text-muted mb-4">
                          {t('dashboard.emptyState.noCycles.description', { companyName })}
                        </p>
                        <a href="/performancecycles" className="btn btn-primary">
                          <i className="fas fa-plus mr-2"></i>
                          {t('dashboard.emptyState.noCycles.button')}
                        </a>
                      </div>
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

export default Dashboard;