'use client';

import React from 'react';

interface AssessmentCompleteProps {
  employeeName?: string;
  assessmentName?: string;
}

const AssessmentComplete: React.FC<AssessmentCompleteProps> = ({
  employeeName,
  assessmentName
}) => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header bg-success text-white text-center">
          <h4 className="mb-0">
            <i className="fas fa-check-circle mr-2"></i>
            Assessment Complete!
          </h4>
        </div>
        <div className="card-body text-center p-5">
          {/* Success Animation */}
          <div className="mb-4">
            <i className="fas fa-check-circle fa-5x text-success mb-3 animate__animated animate__bounceIn"></i>
          </div>

          {/* Completion Message */}
          <h5 className="text-success mb-3">
            Congratulations{employeeName ? `, ${employeeName}` : ''}!
          </h5>
          
          <p className="lead mb-4">
            You have successfully completed your assessment
            {assessmentName && (
              <>
                {' '}for <strong>{assessmentName}</strong>
              </>
            )}
            .
          </p>

          {/* Next Steps */}
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-info-circle mr-2"></i>
              What&apos;s Next?
            </h6>
            <ul className="mb-0 text-left">
              <li>Your responses have been securely saved</li>
              <li>Your HR team will review the results</li>
              <li>You may be contacted for follow-up discussions</li>
              <li>Thank you for your honest and thoughtful responses</li>
            </ul>
          </div>

          {/* Feedback Message */}
          <div className="bg-light p-3 rounded mb-4">
            <p className="mb-0 text-muted">
              <i className="fas fa-heart text-danger mr-2"></i>
              Your feedback is valuable and helps improve our organization&apos;s agile practices.
            </p>
          </div>

          {/* Action Button */}
          <div className="d-flex justify-content-center">
            <button
              onClick={() => window.close()}
              className="btn btn-success btn-lg"
            >
              <i className="fas fa-times mr-2"></i>
              Close Window
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-4 pt-4 border-top">
            <small className="text-muted">
              <i className="fas fa-question-circle mr-1"></i>
              Questions or concerns? Contact your HR department for assistance.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentComplete;