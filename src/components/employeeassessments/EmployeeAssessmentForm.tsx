'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EmployeeAssessment, CreateEmployeeAssessmentDTO } from '@/services/employeeAssessmentService';
import { teamService, Team } from '@/services/teamService';
import { departmentService, Department } from '@/services/departmentService';
import { useTenant } from '@/infrastructure/auth';

interface EmployeeAssessmentFormProps {
  item?: EmployeeAssessment;
  onSubmit: (data: CreateEmployeeAssessmentDTO) => Promise<void>;
  onCancel: () => void;
  existingItems?: EmployeeAssessment[];
}

const EmployeeAssessmentForm: React.FC<EmployeeAssessmentFormProps> = ({
  item,
  onSubmit,
  onCancel,
  existingItems = []
}) => {
  const { tenantId } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateEmployeeAssessmentDTO>({
    tenantId: tenantId || '',
    assessmentMatrixId: '',
    employee: {
      name: '',
      email: ''
    },
    teamId: '',
    assessmentStatus: 'INVITED',
    answeredQuestionCount: 0
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Load teams and departments when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!tenantId) return;
      
      try {
        const [teamsData, departmentsData] = await Promise.all([
          teamService.getAll(),
          departmentService.getAll()
        ]);
        setAllTeams(teamsData);
        setTeams(teamsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [tenantId]);

  // Filter teams when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const filteredTeams = allTeams.filter(team => team.department?.id === selectedDepartment);
      setTeams(filteredTeams);
      // Reset team selection if current team is not in the filtered list
      if (formData.teamId && !filteredTeams.find(t => t.id === formData.teamId)) {
        setFormData(prev => ({ ...prev, teamId: '' }));
      }
    } else {
      setTeams(allTeams);
    }
  }, [selectedDepartment, allTeams, formData.teamId]);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        tenantId: item.tenantId || tenantId || '',
        assessmentMatrixId: item.assessmentMatrixId,
        employee: {
          name: item.employee.name,
          email: item.employee.email
        },
        teamId: item.teamId || '',
        assessmentStatus: item.assessmentStatus || 'INVITED',
        answeredQuestionCount: item.answeredQuestionCount || 0
      });

      // Set department for team filtering
      if (item.teamId) {
        const team = allTeams.find(t => t.id === item.teamId);
        if (team?.department?.id) {
          setSelectedDepartment(team.department.id);
        }
      }
    }
  }, [item, tenantId, allTeams]);

  // Check for duplicate email
  const isDuplicateEmail = useMemo(() => {
    if (!formData.employee.email.trim()) return false;
    
    return existingItems.some(assessment => {
      // Skip comparing with the current item being edited
      if (item && assessment.id === item.id) return false;
      return assessment.employee.email.toLowerCase() === formData.employee.email.toLowerCase();
    });
  }, [formData.employee.email, existingItems, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!formData.employee.name.trim()) {
        throw new Error('Employee name is required');
      }
      if (!formData.employee.email.trim()) {
        throw new Error('Employee email is required');
      }

      // Check for duplicate email (client-side) - only for new assessments or when email changed
      if (isDuplicateEmail && (!item || item.employee.email !== formData.employee.email)) {
        throw new Error(`Employee with email "${formData.employee.email}" already exists in this assessment matrix`);
      }

      await onSubmit(formData);
      
      // If successful and it's a new assessment, show success and reset form
      if (!item) {
        setSuccessMessage(`Employee "${formData.employee.name}" was successfully added to the assessment!`);
        // Reset only employee data, keep department/team selection
        setFormData(prev => ({
          ...prev,
          employee: {
            name: '',
            email: ''
          }
        }));
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => {
      if (field.startsWith('employee.')) {
        const employeeField = field.replace('employee.', '');
        return {
          ...prev,
          employee: {
            ...prev.employee,
            [employeeField]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  return (
    <>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Department/Team Selection Panel */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-sitemap mr-2"></i>
              Department & Team Selection
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    className="form-control"
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="team">Team</label>
                  <select
                    className="form-control"
                    id="team"
                    value={formData.teamId}
                    onChange={(e) => handleChange('teamId', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Team (Optional)</option>
                    {teams.map(team => (
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

        {/* Employee Data Panel */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-user mr-2"></i>
              Employee Information
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="employeeName">Employee Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="employeeName"
                    value={formData.employee.name}
                    onChange={(e) => handleChange('employee.name', e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter employee full name"
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="employeeEmail">Email *</label>
                  <div className="input-group">
                    <input
                      type="email"
                      className={`form-control ${isDuplicateEmail ? 'is-invalid' : ''}`}
                      id="employeeEmail"
                      value={formData.employee.email}
                      onChange={(e) => handleChange('employee.email', e.target.value)}
                      required
                      disabled={isSubmitting}
                      placeholder="employee@company.com"
                    />
                    {!item && (
                      <div className="input-group-append">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting || !formData.employee.name.trim() || !formData.employee.email.trim() || isDuplicateEmail}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-1"></i>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-1"></i>
                              Create
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  {isDuplicateEmail && (
                    <div className="text-danger small mt-1">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      This email already exists in the assessment matrix
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="row">
          <div className="col-12">
            {item && (
              <button
                type="submit"
                className="btn btn-primary mr-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-1"></i>
                    Update Assessment
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <i className="fas fa-times mr-1"></i>
              Close
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default EmployeeAssessmentForm;