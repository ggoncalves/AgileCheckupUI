'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TokenData {
  tenantId: string;
  assessmentMatrixId: string;
}

interface AssessmentMatrix {
  id: string;
  name: string;
  description: string;
}

const InvitationPage: React.FC = () => {
  const params = useParams();
  const token = params.token as string;
  
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [assessmentMatrix, setAssessmentMatrix] = useState<AssessmentMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate token on page load
  useEffect(() => {
    validateToken();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateToken = async () => {
    try {
      setIsValidatingToken(true);
      
      const response = await fetch('/api/invitation/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Invalid or expired invitation link');
      }

      const data = await response.json();
      setTokenData(data);
      
      // Load assessment matrix details
      await loadAssessmentMatrix(data.assessmentMatrixId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate invitation link');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const loadAssessmentMatrix = async (assessmentMatrixId: string) => {
    try {
      const response = await fetch(`/api/assessmentmatrices/${assessmentMatrixId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load assessment details');
      }
      
      const matrix = await response.json();
      setAssessmentMatrix(matrix);
      
    } catch (err) {
      console.error('Error loading assessment matrix:', err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    try {
      setIsValidatingEmail(true);
      setEmailError(null);

      // Validate employee exists in this assessment matrix
      const response = await fetch(`/api/employeeassessments/validate?email=${encodeURIComponent(email)}&assessmentMatrixId=${tokenData?.assessmentMatrixId}`, {
        headers: {
          'X-Tenant-ID': tokenData?.tenantId || ''
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Email not found in this assessment. Please check your email address or contact HR.');
        }
        throw new Error('Failed to validate email');
      }

      const employeeAssessment = await response.json();
      
      // Redirect to assessment page or next step
      // For now, just show success (you'll implement the actual assessment flow later)
      alert(`Welcome ${employeeAssessment.employee.name}! Assessment validation successful.`);
      
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to validate email');
    } finally {
      setIsValidatingEmail(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body text-center py-5">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-4"></i>
            <h4>Validating Invitation</h4>
            <p className="text-muted">Please wait while we validate your invitation link...</p>
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
            <h4>Invalid Invitation</h4>
            <p className="text-muted mb-4">{error}</p>
            <p className="small text-muted">
              Please contact your HR department for a new invitation link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">
            <i className="fas fa-clipboard-check mr-2"></i>
            Employee Assessment Invitation
          </h4>
        </div>
        <div className="card-body p-4">
          {assessmentMatrix && (
            <div className="alert alert-info">
              <h5 className="alert-heading">
                <i className="fas fa-clipboard-check mr-2"></i>
                Assessment: {assessmentMatrix.name}
              </h5>
              <p className="mb-0">{assessmentMatrix.description}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="font-weight-bold">
                Enter your email address to access your assessment:
              </label>
              <input
                type="email"
                className={`form-control ${emailError ? 'is-invalid' : ''}`}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
                disabled={isValidatingEmail}
              />
              {emailError && (
                <div className="invalid-feedback">{emailError}</div>
              )}
              <small className="form-text text-muted">
                Use the same email address that HR used to send you this invitation.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isValidatingEmail || !email.trim()}
            >
              {isValidatingEmail ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Validating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Access My Assessment
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Need help? Contact your HR department.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;