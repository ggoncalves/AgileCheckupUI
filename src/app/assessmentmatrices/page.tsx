'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import AssessmentMatrixForm from '../../components/assessmentmatrices/AssessmentMatrixForm';
import AssessmentMatrixStructureModal from '../../components/assessmentmatrices/AssessmentMatrixStructureModal';
import TeamStatusTable from '../../components/assessmentmatrices/TeamStatusTable';
import EmployeeStatusTable from '../../components/assessmentmatrices/EmployeeStatusTable';
import { assessmentMatrixService, AssessmentMatrix, Pillar, getDashboard, DashboardResponse } from '@/services/assessmentMatrixService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { useTenant } from '@/infrastructure/auth';

const AssessmentMatrixPage: React.FC = () => {
  const { t } = useTranslation();
  const { } = useTenant();
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [selectedMatrixForStructure, setSelectedMatrixForStructure] = useState<AssessmentMatrix | null>(null);
  const [showStructureModal, setShowStructureModal] = useState(false);

  // Dashboard state
  const [selectedMatrixForDashboard, setSelectedMatrixForDashboard] = useState<AssessmentMatrix | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ teamId: string; teamName: string } | null>(null);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePageSize] = useState(20);

  // Load performance cycles for rendering
  useEffect(() => {
    const fetchPerformanceCycles = async () => {
      try {
        const cycles = await performanceCycleService.getAll();
        const activeCycles = cycles.filter(cycle => cycle.isActive);
        setPerformanceCycles(activeCycles);
      } catch (error) {
        console.error('Error fetching performance cycles:', error);
      }
    };

    fetchPerformanceCycles();
  }, []);

  const handleShowStructure = (matrix: AssessmentMatrix) => {
    setSelectedMatrixForStructure(matrix);
    setShowStructureModal(true);
  };

  const handleCloseStructureModal = () => {
    setShowStructureModal(false);
    setSelectedMatrixForStructure(null);
  };

  // Helper function to format pillar map
  const formatPillarMap = (pillarMap: { [key: string]: Pillar }) => {
    if (!pillarMap || Object.keys(pillarMap).length === 0) {
      return t('assessmentMatrix.messages.noPillarsDefined');
    }
    
    const pillarCount = Object.keys(pillarMap).length;
    const categoryCount = Object.values(pillarMap).reduce((total, pillar) => {
      return total + (pillar.categoryMap ? Object.keys(pillar.categoryMap).length : 0);
    }, 0);
    
    return t('assessmentMatrix.structure.summary', { pillarCount, categoryCount });
  };

  // Helper function to get performance cycle name
  const getPerformanceCycleName = (cycleId: string) => {
    const cycle = performanceCycles.find(c => c.id === cycleId);
    return cycle ? cycle.name : cycleId;
  };

  // Define columns for assessment matrix table
  const columns: CrudColumn<AssessmentMatrix>[] = [
    { key: 'name', label: t('assessmentMatrix.columns.name'), sortable: true, className: 'col-md-2' },
    { key: 'description', label: t('assessmentMatrix.columns.description'), sortable: true, className: 'col-md-2' },
    {
      key: 'performanceCycleId',
      label: t('assessmentMatrix.columns.performanceCycle'),
      sortable: true,
      className: 'col-md-2',
      render: (matrix) => getPerformanceCycleName(matrix.performanceCycleId)
    },
    {
      key: 'pillarMap',
      label: t('assessmentMatrix.columns.structure'),
      sortable: false,
      className: 'col-md-2',
      render: (matrix) => (
        <div className="d-flex justify-content-between align-items-center">
          <span>{formatPillarMap(matrix.pillarMap)}</span>
          <button
            className="btn btn-sm btn-outline-info ml-2"
            onClick={() => handleShowStructure(matrix)}
            title={t('assessmentMatrix.actions.viewStructure')}
          >
            <i className="fas fa-sitemap"></i>
          </button>
        </div>
      )
    },
    {
      key: 'questionCount',
      label: t('assessmentMatrix.columns.questions'),
      sortable: true,
      className: 'col-md-1',
      render: (matrix) => matrix.questionCount || 0
    }
  ];

  // Custom action buttons for assessment matrices
  const renderCustomActions = (matrix: AssessmentMatrix) => (
    <>
      <button
        className="btn btn-sm btn-primary mr-1"
        onClick={() => handleShowDashboard(matrix)}
        disabled={isDashboardLoading && selectedMatrixForDashboard?.id === matrix.id}
        title={t('assessmentMatrix.actions.viewDashboard')}
      >
        {isDashboardLoading && selectedMatrixForDashboard?.id === matrix.id ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            <span className="d-none d-sm-inline ml-1">{t('common.status.loading')}</span>
          </>
        ) : (
          <i className="fas fa-chart-bar"></i>
        )}
      </button>
    </>
  );

  // Dashboard functions
  const handleShowDashboard = async (matrix: AssessmentMatrix) => {
    setSelectedMatrixForDashboard(matrix);
    setSelectedTeam(null);
    setEmployeePage(1);
    await loadDashboardData(matrix.id, 1, employeePageSize);
    
    // Smooth scroll to dashboard section
    setTimeout(() => {
      const dashboardElement = document.getElementById('dashboard-section');
      if (dashboardElement) {
        dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const loadDashboardData = async (matrixId: string, page: number = 1, pageSize: number = employeePageSize) => {
    setIsDashboardLoading(true);
    try {
      const data = await getDashboard(matrixId, page, pageSize);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const handleTeamClick = async (teamId: string, teamName: string) => {
    setSelectedTeam({ teamId, teamName });
    setEmployeePage(1);
    
    if (selectedMatrixForDashboard) {
      await loadDashboardData(selectedMatrixForDashboard.id, 1, employeePageSize);
    }
    
    // Smooth scroll to employee section
    setTimeout(() => {
      const employeeElement = document.getElementById('employee-section');
      if (employeeElement) {
        employeeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleEmployeePageChange = async (page: number) => {
    setEmployeePage(page);
    if (selectedMatrixForDashboard) {
      await loadDashboardData(selectedMatrixForDashboard.id, page, employeePageSize);
    }
  };

  const handleRefreshDashboard = async () => {
    if (selectedMatrixForDashboard) {
      await loadDashboardData(selectedMatrixForDashboard.id, employeePage, employeePageSize);
    }
  };

  const closeDashboard = () => {
    setSelectedMatrixForDashboard(null);
    setDashboardData(null);
    setSelectedTeam(null);
    setEmployeePage(1);
  };


  return (
    <AdminLayout>
      <AbstractCRUD<AssessmentMatrix>
        title={t('assessmentMatrix.title')}
        columns={columns}
        api={assessmentMatrixService}
        FormComponent={AssessmentMatrixForm}
        itemName={t('assessmentMatrix.singular')}
        customActions={renderCustomActions}
      />

      {/* Container for dashboard sections */}
      <div className="container-fluid">

        {/* Dashboard Section */}
        {selectedMatrixForDashboard && (
          <div id="dashboard-section">
            {isDashboardLoading && !dashboardData ? (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="sr-only">{t('common.status.loading')}</span>
                      </div>
                      <h5 className="text-muted">{t('assessmentMatrix.dashboard.loading')}</h5>
                      <p className="text-muted">{t('assessmentMatrix.dashboard.loadingMessage', { matrixName: selectedMatrixForDashboard.name })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : dashboardData ? (
              <TeamStatusTable
                teamSummaries={dashboardData.teamSummaries}
                matrixName={dashboardData.matrixName}
                totalEmployees={dashboardData.totalEmployees}
                completedAssessments={dashboardData.completedAssessments}
                onTeamClick={handleTeamClick}
                onRefresh={handleRefreshDashboard}
                isLoading={isDashboardLoading}
              />
            ) : null}
          </div>
        )}

        {/* Employee Details Section */}
        {selectedMatrixForDashboard && dashboardData && selectedTeam && (
          <div id="employee-section">
            <EmployeeStatusTable
              employeeData={{
                ...dashboardData.employees,
                content: dashboardData.employees.content.filter(emp => 
                  emp.teamId === selectedTeam.teamId
                ),
                totalCount: dashboardData.employees.content.filter(emp => 
                  emp.teamId === selectedTeam.teamId
                ).length
              }}
              teamName={selectedTeam.teamName}
              matrixName={dashboardData.matrixName}
              onPageChange={handleEmployeePageChange}
              onRefresh={handleRefreshDashboard}
              isLoading={isDashboardLoading}
            />
          </div>
        )}

        {/* Close Dashboard Button */}
        {selectedMatrixForDashboard && (
          <div className="row mt-3">
            <div className="col-12 text-center">
              <button
                className="btn btn-outline-secondary"
                onClick={closeDashboard}
              >
                <i className="fas fa-times mr-1"></i>
                {t('assessmentMatrix.actions.closeDashboard')}
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedMatrixForStructure && (
        <AssessmentMatrixStructureModal
          matrix={selectedMatrixForStructure}
          isOpen={showStructureModal}
          onClose={handleCloseStructureModal}
        />
      )}
    </AdminLayout>
  );
};

export default AssessmentMatrixPage;