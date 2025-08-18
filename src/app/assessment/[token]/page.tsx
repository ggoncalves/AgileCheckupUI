"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSSRTranslation } from "@/hooks/useSSRTranslation";
import AssessmentTaking from "../../../components/assessment/AssessmentTaking";
import AssessmentComplete from "../../../components/assessment/AssessmentComplete";

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
  const searchParams = useSearchParams();
  const token = params.token as string;
  const { t, ready } = useSSRTranslation();

  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeAssessmentId, setEmployeeAssessmentId] = useState<
    string | null
  >(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [assessmentMatrix, setAssessmentMatrix] =
    useState<AssessmentMatrix | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    validateAndLoadAssessment();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateAndLoadAssessment = async () => {
    setIsValidating(true);
    setError(null);

    try {
      // First, validate the token
      const tokenResponse = await fetch("/api/invitation/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!tokenResponse.ok) {
        throw new Error(t("assessment.errors.invalidInvitation"));
      }

      const tokenData: TokenData = await tokenResponse.json();
      setTenantId(tokenData.tenantId);
      
      // Save tenantId to localStorage for API service to use (critical for private tabs)
      localStorage.setItem('tenantId', tokenData.tenantId);

      // Load assessment matrix details
      const matrixResponse = await fetch(
        `/api/assessmentmatrices/${tokenData.assessmentMatrixId}`,
      );
      if (matrixResponse.ok) {
        const matrix = await matrixResponse.json();
        setAssessmentMatrix(matrix);
      }

      // Try multiple sources for email: URL params, localStorage, sessionStorage
      let savedEmail = searchParams.get('email'); // From URL parameter
      
      if (!savedEmail) {
        savedEmail = localStorage.getItem(`assessment-email-${token}`);
      }
      
      if (!savedEmail) {
        savedEmail = sessionStorage.getItem(`assessment-email-${token}`);
      }
      
      if (!savedEmail) {
        // Redirect to invitation page for email collection
        router.push(`/invitation/${token}`);
        return;
      }

      // Save email to both storages if it came from URL parameter
      if (searchParams.get('email')) {
        localStorage.setItem(`assessment-email-${token}`, savedEmail);
        sessionStorage.setItem(`assessment-email-${token}`, savedEmail);
      }

      // Continue with employee validation if we have a saved email
      await validateEmployee(savedEmail, tokenData);

    } catch (err) {
      // If token validation or matrix loading fails, show error
      const errorMessage =
        err instanceof Error ? err.message : t("assessment.errors.loadFailed");
      setError(errorMessage);
      setIsValidating(false);
    }
  };

  const validateEmployee = async (email: string, tokenData: TokenData) => {
    try {

      // Validate the employee with the saved email
      const validationResponse = await fetch(
        "/api/employeeassessments/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            assessmentMatrixId: tokenData.assessmentMatrixId,
            tenantId: tokenData.tenantId,
          }),
        },
      );

      if (!validationResponse.ok) {
        throw new Error(t("assessment.errors.employeeValidationFailed"));
      }

      const validationResult: EmployeeValidationResponse =
        await validationResponse.json();

      if (
        validationResult.status !== "SUCCESS" &&
        validationResult.status !== "INFO"
      ) {
        throw new Error(validationResult.message || t("assessment.errors.validationFailed"));
      }

      if (!validationResult.employeeAssessmentId) {
        throw new Error(t("assessment.errors.noAssessmentFound"));
      }

      // Check if assessment is already completed
      if (validationResult.assessmentStatus === "COMPLETED") {
        setEmployeeName(validationResult.name || null);
        setIsComplete(true);
      } else {
        setEmployeeAssessmentId(validationResult.employeeAssessmentId);
        setEmployeeName(validationResult.name || null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("assessment.errors.loadFailed");
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


  // Wait for i18n to be ready
  if (!ready) {
    return null;
  }

  if (isValidating) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div
          className="card shadow"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <div className="card-body text-center py-5">
            <i className="fas fa-spinner fa-spin fa-3x text-primary mb-4"></i>
            <h4>{t("assessment.taking.loading")}</h4>
            <p className="text-muted">
              {t("assessment.taking.loadingMessage")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div
          className="card shadow"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-4"></i>
            <h4>{t("assessment.taking.error")}</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                onClick={validateAndLoadAssessment}
                className="btn btn-primary"
              >
                <i className="fas fa-redo mr-2"></i>
                {t("assessment.taking.buttons.tryAgain")}
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

  if (employeeAssessmentId && tenantId) {
    return (
      <AssessmentTaking
        employeeAssessmentId={employeeAssessmentId}
        tenantId={tenantId}
        onComplete={handleAssessmentComplete}
        onError={handleAssessmentError}
      />
    );
  }

  // This shouldn't happen, but just in case
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: "500px", width: "100%" }}>
        <div className="card-body text-center py-5">
          <i className="fas fa-question-circle fa-3x text-warning mb-4"></i>
          <h4>{t("assessment.errors.notReady")}</h4>
          <p className="text-muted mb-4">
            {t("assessment.errors.notReadyMessage")}
          </p>
          <button
            onClick={() => (window.location.href = `/invitation/${token}`)}
            className="btn btn-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            {t("assessment.errors.returnToInvitation")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
