import React from 'react';
import { EmployeeAssessmentDetail, EmployeePageResponse } from '@/services/assessmentMatrixService';

interface EmployeeStatusTableProps {
  employeeData: EmployeePageResponse;
  teamName: string;
  matrixName: string;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const EmployeeStatusTable: React.FC<EmployeeStatusTableProps> = ({
  employeeData,
  teamName,
  matrixName,
  onPageChange,
  onRefresh,
  isLoading = false
}) => {
  const totalPages = Math.ceil(employeeData.totalCount / employeeData.pageSize);
  const startIndex = (employeeData.page - 1) * employeeData.pageSize + 1;
  const endIndex = Math.min(employeeData.page * employeeData.pageSize, employeeData.totalCount);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <span className="badge badge-success">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-warning">In Progress</span>;
      case 'INVITED':
        return <span className="badge badge-info">Invited</span>;
      case 'CONFIRMED':
        return <span className="badge badge-secondary">Confirmed</span>;
      default:
        return <span className="badge badge-light">{status}</span>;
    }
  };

  const formatLastActivity = (lastActivityDate?: string) => {
    if (!lastActivityDate) return <span className="text-muted">Never</span>;
    
    try {
      const date = new Date(lastActivityDate);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays === 0) {
        if (diffInHours === 0) {
          return <small>Less than 1 hour ago</small>;
        }
        return <small>{diffInHours} hour{diffInHours !== 1 ? 's' : ''} ago</small>;
      } else if (diffInDays === 1) {
        return <small>1 day ago</small>;
      } else if (diffInDays <= 7) {
        return <small>{diffInDays} days ago</small>;
      } else {
        return <small>{date.toLocaleDateString()}</small>;
      }
    } catch {
      return <span className="text-muted">Unknown</span>;
    }
  };

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-users mr-2"></i>
              Employee Status Details - {teamName} Team
            </h3>
            <div className="card-tools">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh Employee Data"
              >
                <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                {isLoading ? ' Refreshing...' : ' Refresh'}
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div className="mt-2">Loading employee data...</div>
                      </td>
                    </tr>
                  ) : employeeData.content.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <div className="text-muted">
                          <i className="fas fa-user-slash fa-2x mb-2"></i>
                          <div>No employees found for {teamName} team</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employeeData.content.map((employee) => (
                      <tr key={employee.employeeAssessmentId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="user-initials-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
                                 style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {employee.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-weight-bold">{employee.employeeName}</div>
                              <small className="text-muted">{employee.employeeEmail}</small>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(employee.status)}</td>
                        <td>
                          <div className="progress progress-sm mb-1">
                            <div 
                              className={`progress-bar ${
                                employee.status === 'COMPLETED' ? 'bg-success' : 
                                employee.answeredQuestions > 0 ? 'bg-warning' : 'bg-light'
                              }`}
                              style={{ 
                                width: employee.status === 'COMPLETED' ? '100%' : 
                                       `${(employee.answeredQuestions / (employee.answeredQuestions + 10)) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <small>{employee.answeredQuestions} questions answered</small>
                        </td>
                        <td>{formatLastActivity(employee.lastActivityDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {employeeData.totalCount > 0 && (
            <div className="card-footer">
              <div className="row">
                <div className="col-sm-12 col-md-5">
                  <div className="dataTables_info">
                    Showing {startIndex} to {endIndex} of {employeeData.totalCount} employees
                  </div>
                </div>
                <div className="col-sm-12 col-md-7">
                  {totalPages > 1 && (
                    <nav aria-label="Employee pagination">
                      <ul className="pagination pagination-sm m-0 float-right">
                        <li className={`page-item ${employeeData.page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => onPageChange(employeeData.page - 1)}
                            disabled={employeeData.page === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (employeeData.page <= 3) {
                            pageNum = index + 1;
                          } else if (employeeData.page >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = employeeData.page - 2 + index;
                          }

                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${employeeData.page === pageNum ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => onPageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        <li className={`page-item ${employeeData.page === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => onPageChange(employeeData.page + 1)}
                            disabled={employeeData.page === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatusTable;