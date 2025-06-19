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

interface EmployeeValidationResponse {
  status: string;
  message: string;
  employeeAssessmentId?: string;
  name?: string;
  assessmentStatus?: string;
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
  const [validationResponse, setValidationResponse] = useState<EmployeeValidationResponse | null>(null);
  const [showStartAssessment, setShowStartAssessment] = useState(false);

  // Validate token on page load
  useEffect(() => {
    validateToken();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if employee is already confirmed on page load (for direct link access)
  useEffect(() => {
    if (tokenData?.tenantId && tokenData?.assessmentMatrixId) {
      checkExistingConfirmedEmployee();
    }
  }, [tokenData]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Call the new validation API
      const response = await fetch('/api/employeeassessments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          assessmentMatrixId: tokenData?.assessmentMatrixId,
          tenantId: tokenData?.tenantId
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('We couldn\'t find your assessment invitation. Please check that you\'re using the same email address that HR used to invite you, or contact your HR department for assistance.');
        }
        throw new Error('Failed to validate email');
      }

      const validationResult: EmployeeValidationResponse = await response.json();
      
      if (validationResult.status === 'SUCCESS' || validationResult.status === 'INFO') {
        // Both SUCCESS and INFO should show the start assessment page
        // Save email to localStorage for future visits
        localStorage.setItem(`assessment-email-${token}`, email.trim());
        setValidationResponse(validationResult);
        setShowStartAssessment(true);
        // Ensure error state is completely cleared
        setEmailError(null);
      } else {
        // For ERROR status, show the message as an error
        throw new Error(validationResult.message || 'Validation failed');
      }
      
    } catch (err) {
      // Only show error if we're not already showing the start assessment page
      if (!showStartAssessment) {
        setEmailError(err instanceof Error ? err.message : 'Failed to validate email');
      }
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const checkExistingConfirmedEmployee = async () => {
    // Check if there's a saved email from a previous validation
    const savedEmail = localStorage.getItem(`assessment-email-${token}`);
    if (savedEmail) {
      await validateExistingEmployee(savedEmail);
    }
  };

  const validateExistingEmployee = async (emailToValidate: string) => {
    try {
      const response = await fetch('/api/employeeassessments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToValidate,
          assessmentMatrixId: tokenData?.assessmentMatrixId,
          tenantId: tokenData?.tenantId
        })
      });

      if (response.ok) {
        const validationResult: EmployeeValidationResponse = await response.json();
        
        if ((validationResult.status === 'SUCCESS' || validationResult.status === 'INFO') && 
            validationResult.assessmentStatus === 'CONFIRMED') {
          setEmail(emailToValidate);
          setValidationResponse(validationResult);
          setShowStartAssessment(true);
        }
      }
    } catch {
      // Silently fail - user will need to enter email again
      console.log('No existing confirmed employee found');
      // Clear localStorage if validation fails
      localStorage.removeItem(`assessment-email-${token}`);
    }
  };

  const handleStartAssessment = () => {
    // Navigate to the assessment taking page
    window.location.href = `/assessment/${token}`;
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

  // Show start assessment page if validation was successful
  if (showStartAssessment && validationResponse) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="card-header bg-success text-white text-center">
            <h4 className="mb-0">
              <i className="fas fa-check-circle mr-2"></i>
              Welcome to Your Assessment
            </h4>
          </div>
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <i className="fas fa-user-check fa-4x text-success mb-3"></i>
              <h5 className="text-success">Hello, {validationResponse.name}!</h5>
              <p className="text-muted">
                {validationResponse.message}
              </p>
            </div>

            {assessmentMatrix && (
              <div className="alert alert-info">
                <h5 className="alert-heading mb-2">
                  <i className="fas fa-clipboard-check mr-2"></i>
                  {assessmentMatrix.name}
                </h5>
                <p className="mb-0">{assessmentMatrix.description}</p>
              </div>
            )}

            <div className="alert alert-warning">
              <h6 className="alert-heading">
                <i className="fas fa-info-circle mr-2"></i>
                Before You Begin
              </h6>
              <ul className="mb-0">
                <li>Set aside adequate time to complete the assessment</li>
                <li>Answer all questions honestly and thoughtfully</li>
                <li>You can save and return to complete it later if needed</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartAssessment}
                className="btn btn-success btn-lg"
              >
                <i className={`fas ${validationResponse.assessmentStatus === 'IN_PROGRESS' ? 'fa-play-circle' : 'fa-play'} mr-2`}></i>
                {validationResponse.assessmentStatus === 'IN_PROGRESS' ? 'Continue Assessment' : 'Start Assessment'}
              </button>
            </div>

            <div className="text-center mt-4">
              <small className="text-muted">
                Assessment Status: <span className="badge badge-info">{validationResponse.assessmentStatus}</span>
              </small>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                Need help? Contact your HR department.
              </small>
            </div>
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