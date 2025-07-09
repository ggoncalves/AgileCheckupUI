import React from 'react';
import { useTranslation } from 'react-i18next';
import { TeamSummary } from '@/services/assessmentMatrixService';

interface TeamStatusTableProps {
  teamSummaries: TeamSummary[];
  matrixName: string;
  totalEmployees: number;
  completedAssessments: number;
  onTeamClick: (teamId: string, teamName: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const TeamStatusTable: React.FC<TeamStatusTableProps> = ({
  teamSummaries,
  matrixName,
  totalEmployees,
  completedAssessments,
  onTeamClick,
  onRefresh,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const completionRate = totalEmployees > 0 ? Math.round((completedAssessments / totalEmployees) * 100) : 0;

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-tachometer-alt mr-2"></i>
              {t('assessmentMatrix.dashboard.title')} - {matrixName}
            </h3>
            <div className="card-tools">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={onRefresh}
                disabled={isLoading}
                title={t('assessmentMatrix.dashboard.refreshTitle')}
              >
                <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                {isLoading ? ` ${t('assessmentMatrix.dashboard.refreshing')}` : ` ${t('assessmentMatrix.dashboard.refresh')}`}
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="info-box">
                  <span className="info-box-icon bg-primary elevation-1">
                    <i className="fas fa-users"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">{t('assessmentMatrix.dashboard.totalEmployees')}</span>
                    <span className="info-box-number">{totalEmployees}</span>
                    <span className="info-box-more">{t('assessmentMatrix.dashboard.assignedToAssessment')}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="info-box">
                  <span className="info-box-icon bg-success elevation-1">
                    <i className="fas fa-check-circle"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">{t('assessmentMatrix.dashboard.completed')}</span>
                    <span className="info-box-number">{completedAssessments}</span>
                    <span className="info-box-more">{t('assessmentMatrix.dashboard.completionRate', { rate: completionRate })}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="info-box">
                  <span className="info-box-icon bg-warning elevation-1">
                    <i className="fas fa-clock"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">{t('assessmentMatrix.dashboard.inProgress')}</span>
                    <span className="info-box-number">{totalEmployees - completedAssessments}</span>
                    <span className="info-box-more">{t('assessmentMatrix.dashboard.remaining', { percentage: 100 - completionRate })}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="info-box">
                  <span className="info-box-icon bg-info elevation-1">
                    <i className="fas fa-users-cog"></i>
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">{t('assessmentMatrix.dashboard.teams')}</span>
                    <span className="info-box-number">{teamSummaries.length}</span>
                    <span className="info-box-more">{t('assessmentMatrix.dashboard.withAssignedEmployees')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Status Table */}
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>{t('assessmentMatrix.dashboard.columns.team')}</th>
                    <th>{t('assessmentMatrix.dashboard.columns.totalEmployees')}</th>
                    <th>{t('assessmentMatrix.dashboard.columns.completed')}</th>
                    <th>{t('assessmentMatrix.dashboard.columns.inProgress')}</th>
                    <th>{t('assessmentMatrix.dashboard.columns.progress')}</th>
                    <th>{t('assessmentMatrix.dashboard.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">{t('common.status.loading')}</span>
                        </div>
                        <div className="mt-2">{t('assessmentMatrix.dashboard.loadingTeamData')}</div>
                      </td>
                    </tr>
                  ) : teamSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <div className="text-muted">
                          <i className="fas fa-users fa-2x mb-2"></i>
                          <div>{t('assessmentMatrix.dashboard.noTeamData')}</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    teamSummaries.map((team) => {
                      const inProgress = team.totalEmployees - team.completedAssessments;
                      return (
                        <tr key={team.teamId} style={{ cursor: 'pointer' }}>
                          <td>
                            <strong>{team.teamName}</strong>
                          </td>
                          <td>{team.totalEmployees}</td>
                          <td>
                            <span className="badge badge-success">{team.completedAssessments}</span>
                          </td>
                          <td>
                            <span className="badge badge-warning">{inProgress}</span>
                          </td>
                          <td>
                            <div className="progress progress-sm mb-1">
                              <div 
                                className="progress-bar bg-success" 
                                style={{ width: `${team.completionPercentage}%` }}
                              ></div>
                            </div>
                            <small>{Math.round(team.completionPercentage)}%</small>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => onTeamClick(team.teamId, team.teamName)}
                              title={`View employee details for ${team.teamName}`}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatusTable;