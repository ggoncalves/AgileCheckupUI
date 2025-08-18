"use client";

import React from "react";
import { useSSRTranslation } from "@/hooks/useSSRTranslation";

interface AssessmentCompleteProps {
  employeeName?: string;
  assessmentName?: string;
}

const AssessmentComplete: React.FC<AssessmentCompleteProps> = ({
  employeeName,
  assessmentName,
}) => {
  const { t } = useSSRTranslation();
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="card-header bg-success text-white text-center">
          <h4 className="mb-0">
            <i className="fas fa-check-circle mr-2"></i>
            {t("assessment.complete.title")}
          </h4>
        </div>
        <div className="card-body text-center p-5">
          {/* Success Animation */}
          <div className="mb-4">
            <i className="fas fa-check-circle fa-5x text-success mb-3 animate__animated animate__bounceIn"></i>
          </div>

          {/* Completion Message */}
          <h5 className="text-success mb-3">
            {employeeName ? t("assessment.complete.congratulationsWithName", { name: employeeName }) : t("assessment.complete.congratulations")}
          </h5>

          <p className="lead mb-4">
            {assessmentName ? t("assessment.complete.messageWithAssessment", { assessmentName }) : t("assessment.complete.message")}
          </p>

          {/* Next Steps */}
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-info-circle mr-2"></i>
              {t("assessment.complete.whatsNext.title")}
            </h6>
            <ul className="mb-0 text-left">
              <li>{t("assessment.complete.whatsNext.saved")}</li>
              <li>{t("assessment.complete.whatsNext.review")}</li>
              <li>{t("assessment.complete.whatsNext.contact")}</li>
              <li>{t("assessment.complete.whatsNext.thanks")}</li>
            </ul>
          </div>

          {/* Feedback Message */}
          <div className="bg-light p-3 rounded mb-4">
            <p className="mb-0 text-muted">
              <i className="fas fa-heart text-danger mr-2"></i>
              {t("assessment.complete.feedback")}
            </p>
          </div>

          {/* Action Button */}
          <div className="d-flex justify-content-center">
            <button
              onClick={() => window.close()}
              className="btn btn-success btn-lg"
            >
              <i className="fas fa-times mr-2"></i>
              {t("assessment.complete.buttons.closeWindow")}
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-4 pt-4 border-top">
            <small className="text-muted">
              <i className="fas fa-question-circle mr-1"></i>
              {t("assessment.complete.footer")}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentComplete;
