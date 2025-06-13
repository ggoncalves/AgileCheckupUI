'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import TenantProtected from '@/components/TenantProtected';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import EmployeeAssessmentForm from '@/components/employeeassessments/EmployeeAssessmentForm';
import { EmployeeAssessment, employeeAssessmentService } from '@/services/employeeAssessmentService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { assessmentMatrixService, AssessmentMatrix } from '@/services/assessmentMatrixService';
import { departmentService, Department } from '@/services/departmentService';
import { teamService, Team } from '@/services/teamService';
import { useTenant } from '@/contexts/TenantContext';

const EmployeeAssessmentPage: React.FC = () => {
  const { tenantId } = useTenant();
  const [selectedPerformanceCycle, setSelectedPerformanceCycle] = useState<string>('');
  const [selectedAssessmentMatrix, setSelectedAssessmentMatrix] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [assessmentMatrices, setAssessmentMatrices] = useState<AssessmentMatrix[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    if (tenantId) {
      loadPerformanceCycles();
      loadDepartments();
      loadAllTeams();
    }
  }, [tenantId]);

  // Filter assessment matrices based on selected performance cycle
  useEffect(() => {
    if (selectedPerformanceCycle) {
      loadAssessmentMatrices();
    } else {
      setAssessmentMatrices([]);
      setSelectedAssessmentMatrix('');
    }
  }, [selectedPerformanceCycle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset assessment matrix selection when performance cycle changes
  useEffect(() => {
    setSelectedAssessmentMatrix('');
    setGeneratedToken(''); // Clear token when performance cycle changes
  }, [selectedPerformanceCycle]);

  // Clear token when assessment matrix changes
  useEffect(() => {
    setGeneratedToken('');
  }, [selectedAssessmentMatrix]);

  // Filter teams based on selected department
  useEffect(() => {
    if (selectedDepartment) {
      const filteredTeams = allTeams.filter(team => team.department?.id === selectedDepartment);
      setTeams(filteredTeams);
    } else {
      setTeams(allTeams);
    }
  }, [selectedDepartment, allTeams]);

  const loadPerformanceCycles = async () => {
    try {
      const data = await performanceCycleService.getAll();
      setPerformanceCycles(data);
    } catch (error) {
      console.error('Error loading performance cycles:', error);
    }
  };

  const loadAssessmentMatrices = useCallback(async () => {
    try {
      const data = await assessmentMatrixService.getAll();
      // Filter by selected performance cycle
      const filtered = data.filter(matrix => matrix.performanceCycleId === selectedPerformanceCycle);
      setAssessmentMatrices(filtered);
    } catch (error) {
      console.error('Error loading assessment matrices:', error);
    }
  }, [selectedPerformanceCycle]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadAllTeams = async () => {
    try {
      const data = await teamService.getAll();
      setAllTeams(data);
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };


  // Create a filtered API that only returns assessments for selected matrix
  const filteredEmployeeAssessmentApi = useMemo(() => ({
    getAll: async (): Promise<EmployeeAssessment[]> => {
      if (!selectedAssessmentMatrix) {
        return [];
      }
      
      try {
        const data = await employeeAssessmentService.getByAssessmentMatrix(selectedAssessmentMatrix);
        
        // Filter by team if selected
        let filteredData = data;
        if (selectedTeam) {
          filteredData = data.filter(assessment => assessment.teamId === selectedTeam);
        }
        
        // Update employee count for the context panel
        setEmployeeCount(filteredData.length);
        
        return filteredData;
      } catch (error) {
        console.error('Error loading employee assessments:', error);
        return [];
      }
    },

    getById: async (id: string): Promise<EmployeeAssessment> => {
      return employeeAssessmentService.getById(id);
    },

    create: async (data: Omit<EmployeeAssessment, 'id'>): Promise<EmployeeAssessment> => {
      const newItem = {
        ...data,
        tenantId,
        assessmentMatrixId: selectedAssessmentMatrix,
        teamId: selectedTeam || undefined,
      };
      return employeeAssessmentService.create(newItem);
    },

    update: async (id: string, data: Partial<EmployeeAssessment>): Promise<EmployeeAssessment> => {
      return employeeAssessmentService.update(id, { ...data, tenantId });
    },

    delete: async (id: string): Promise<void> => {
      return employeeAssessmentService.delete(id);
    }
  }), [selectedAssessmentMatrix, selectedTeam, tenantId]);

  const columns: CrudColumn<EmployeeAssessment>[] = useMemo(() => [
    { 
      key: 'employee.name', 
      label: 'Name',
      sortable: true,
      render: (item: EmployeeAssessment) => item.employee.name
    },
    { 
      key: 'employee.email', 
      label: 'Email',
      sortable: true,
      render: (item: EmployeeAssessment) => item.employee.email 
    },
    { 
      key: 'assessmentStatus', 
      label: 'Status',
      sortable: true,
      render: (item: EmployeeAssessment) => (
        <span className={`badge badge-${getStatusBadgeClass(item.assessmentStatus || 'INVITED')}`}>
          {item.assessmentStatus || 'INVITED'}
        </span>
      )
    },
    { 
      key: 'teamId', 
      label: 'Team',
      sortable: true,
      className: 'col-2',
      render: (item: EmployeeAssessment) => {
        const team = allTeams.find(t => t.id === item.teamId);
        return team ? team.name : '-';
      }
    },
    { 
      key: 'answeredQuestionCount', 
      label: 'Answered Questions',
      sortable: true,
      className: 'col-1',
      render: (item: EmployeeAssessment) => item.answeredQuestionCount || 0
    },
  ], [allTeams]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'INVITED': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      default: return 'secondary';
    }
  };

  const canEdit = (item: EmployeeAssessment) => {
    return item.assessmentStatus === 'INVITED';
  };

  const canDelete = (item: EmployeeAssessment) => {
    return item.assessmentStatus === 'INVITED' || item.assessmentStatus === 'CONFIRMED';
  };

  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [isGeneratingToken, setIsGeneratingToken] = useState<boolean>(false);

  const generateInvitationToken = async () => {
    if (!selectedAssessmentMatrix) return '';
    
    try {
      setIsGeneratingToken(true);
      const response = await fetch(`/api/assessmentmatrices/${selectedAssessmentMatrix}/generate-invitation-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invitation token');
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating invitation token:', error);
      throw error;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const generateInvitationLink = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/invitation/${token}/`;
  };

  const copyInvitationLink = async () => {
    try {
      let token = generatedToken;
      
      // Generate token if not already generated
      if (!token) {
        token = await generateInvitationToken();
        setGeneratedToken(token);
      }
      
      const link = generateInvitationLink(token);
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // For the fallback, we need to generate token first if not available
      try {
        let token = generatedToken;
        if (!token) {
          token = await generateInvitationToken();
          setGeneratedToken(token);
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generateInvitationLink(token);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy link with fallback:', fallbackErr);
      }
    }
  };

  const getSelectedMatrixName = () => {
    const matrix = assessmentMatrices.find(m => m.id === selectedAssessmentMatrix);
    return matrix ? matrix.name : '';
  };

  const renderFilters = () => (
    <div className="card mb-4">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-filter mr-2"></i>
          Filters
        </h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3">
            <div className="form-group">
              <label>Performance Cycle *</label>
              <select
                className="form-control"
                value={selectedPerformanceCycle}
                onChange={(e) => setSelectedPerformanceCycle(e.target.value)}
              >
                <option value="">Select Performance Cycle</option>
                {performanceCycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group">
              <label>Assessment Matrix *</label>
              <select
                className="form-control"
                value={selectedAssessmentMatrix}
                onChange={(e) => setSelectedAssessmentMatrix(e.target.value)}
                disabled={!selectedPerformanceCycle}
              >
                <option value="">Select Assessment Matrix</option>
                {assessmentMatrices.map((matrix) => (
                  <option key={matrix.id} value={matrix.id}>
                    {matrix.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group">
              <label>Department</label>
              <select
                className="form-control"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group">
              <label>Team</label>
              <select
                className="form-control"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessmentMatrixContextPanel = () => (
    <div className="card bg-light mb-4">
      <div className="card-body py-3">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-flex align-items-center">
              <i className="fas fa-clipboard-list text-primary fa-2x mr-3"></i>
              <div>
                <h5 className="mb-1">
                  {getSelectedMatrixName()}
                </h5>
                <p className="text-muted mb-0">
                  <i className="fas fa-users mr-1"></i>
                  {employeeCount} employee{employeeCount !== 1 ? 's' : ''} in this assessment
                  {selectedTeam && (
                    <>
                      {' • '}
                      <i className="fas fa-filter mr-1"></i>
                      Filtered by team
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-right">
            <div className="d-flex align-items-center justify-content-end">
              <div className="mr-3">
                <small className="text-muted d-block">Send this link to all employees:</small>
                <small className="text-muted font-weight-bold">
                  {generatedToken 
                    ? generateInvitationLink(generatedToken)
                    : 'Click "Copy Invitation Link" to generate secure link'
                  }
                </small>
              </div>
              <button
                className={`btn ${copySuccess ? 'btn-success' : 'btn-primary'}`}
                onClick={copyInvitationLink}
                title={`Copy invitation link for ${getSelectedMatrixName()}`}
                disabled={copySuccess || isGeneratingToken}
              >
                {copySuccess ? (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Copied!
                  </>
                ) : isGeneratingToken ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-copy mr-2"></i>
                    Copy Invitation Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <small className="text-info">
              <i className="fas fa-info-circle mr-1"></i>
              Employees will enter their email address on this page to access their assessment
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TenantProtected>
      <AdminLayout>
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">
                  <i className="fas fa-users-cog mr-2"></i>
                  Employee Assessments
                </h1>
              </div>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            {renderFilters()}
            
            {selectedAssessmentMatrix ? (
              <>
                {renderAssessmentMatrixContextPanel()}
                <AbstractCRUD<EmployeeAssessment>
                  key={`${selectedAssessmentMatrix}-${selectedTeam}`}
                  title=""
                  columns={columns}
                  api={filteredEmployeeAssessmentApi}
                  FormComponent={EmployeeAssessmentForm}
                  itemName="Employee Assessment"
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              </>
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-arrow-up fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    Please select a Performance Cycle and Assessment Matrix to manage employee assessments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </AdminLayout>
    </TenantProtected>
  );
};

export default EmployeeAssessmentPage;