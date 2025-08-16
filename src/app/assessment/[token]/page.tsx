'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AssessmentTaking from '../../../components/assessment/AssessmentTaking';
import AssessmentComplete from '../../../components/assessment/AssessmentComplete';

interface TokenData {
  tenantId: string;
  assessmentMatrixId: string;
}

interface EmployeeValidationResponse {
  status: string;
  message: string;
  employeeAssessmentId?: string;
  name?: string;
  assessmentStatus?: string;
}

interface AssessmentMatrix {
  id: string;
  name: string;
  description: string;
}

const AssessmentPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeAssessmentId, setEmployeeAssessmentId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [assessmentMatrix, setAssessmentMatrix] = useState<AssessmentMatrix | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    validateAndLoadAssessment();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateAndLoadAssessment = async () => {
    try {
      setIsValidating(true);
      setError(null);

      // First, validate the token
      const tokenResponse = await fetch('/api/invitation/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!tokenResponse.ok) {
        throw new Error('Invalid or expired invitation link');
      }

      const tokenData: TokenData = await tokenResponse.json();

      // Load assessment matrix details
      const matrixResponse = await fetch(`/api/assessmentmatrices/${tokenData.assessmentMatrixId}`);
      if (matrixResponse.ok) {
        const matrix = await matrixResponse.json();
        setAssessmentMatrix(matrix);
      }

      // Try to get the employee email from localStorage
      const savedEmail = localStorage.getItem(`assessment-email-${token}`);
      if (!savedEmail) {
        // Redirect back to invitation page if no saved email
        router.push(`/invitation/${token}`);
        return;
      }

      // Validate the employee with the saved email
      const validationResponse = await fetch('/api/employeeassessments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: savedEmail,
          assessmentMatrixId: tokenData.assessmentMatrixId,
          tenantId: tokenData.tenantId
        })
      });

      if (!validationResponse.ok) {
        throw new Error('Failed to validate employee for assessment');
      }

      const validationResult: EmployeeValidationResponse = await validationResponse.json();

      if (validationResult.status !== 'SUCCESS' && validationResult.status !== 'INFO') {
        throw new Error(validationResult.message || 'Validation failed');
      }

      if (!validationResult.employeeAssessmentId) {
        throw new Error('No assessment found for this employee');
      }

      // Check if assessment is already completed
      if (validationResult.assessmentStatus === 'COMPLETED') {
        setEmployeeName(validationResult.name || null);
        setIsComplete(true);
      } else {
        setEmployeeAssessmentId(validationResult.employeeAssessmentId);
        setEmployeeName(validationResult.name || null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAssessmentComplete = () => {
    setIsComplete(true);
    setEmployeeAssessmentId(null);
  };

  const handleAssessmentError = (errorMessage: string) => {
    setError(errorMessage);
  };


  if (isValidating) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body text-center py-5">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-4"></i>
            <h4>Loading Assessment</h4>
            <p className="text-muted">Please wait while we prepare your assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-4"></i>
            <h4>Error Loading Assessment</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-2">
              <button 
                onClick={validateAndLoadAssessment}
                className="btn btn-primary"
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <AssessmentComplete
        employeeName={employeeName || undefined}
        assessmentName={assessmentMatrix?.name}
      />
    );
  }

  if (employeeAssessmentId) {
    return (
      <AssessmentTaking
        employeeAssessmentId={employeeAssessmentId}
        onComplete={handleAssessmentComplete}
        onError={handleAssessmentError}
      />
    );
  }

  // This shouldn't happen, but just in case
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body text-center py-5">
          <i className="fas fa-question-circle fa-3x text-warning mb-4"></i>
          <h4>Assessment Not Ready</h4>
          <p className="text-muted mb-4">We couldn&apos;t prepare your assessment. Please try again.</p>
          <button 
            onClick={() => window.location.href = `/invitation/${token}`}
            className="btn btn-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Return to Invitation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;