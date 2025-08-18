"use client";

import React, { useState, useEffect } from "react";
import { useSSRTranslation } from "@/hooks/useSSRTranslation";
import { Question } from "../../services/questionService";
import assessmentService, {
  EmployeeAssessment,
  SaveAnswerRequest,
} from "../../services/assessmentService";
import QuestionRenderer from "./QuestionRenderer";

interface AssessmentTakingProps {
  employeeAssessmentId: string;
  tenantId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

const AssessmentTaking: React.FC<AssessmentTakingProps> = ({
  employeeAssessmentId,
  tenantId,
  onComplete,
  onError,
}) => {
  const { t } = useSSRTranslation();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setAssessment] = useState<EmployeeAssessment | null>(null);

  useEffect(() => {
    loadAssessment();
  }, [employeeAssessmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load assessment details
      const assessmentData =
        await assessmentService.getEmployeeAssessment(employeeAssessmentId);
      setAssessment(assessmentData);

      // Load the first/next question
      const questionData =
        await assessmentService.getNextQuestion(employeeAssessmentId, tenantId);

      if (questionData.question) {
        setCurrentQuestion(questionData.question);
        setProgress({
          current: questionData.currentProgress,
          total: questionData.totalQuestions,
        });
        // Reset form state
        setCurrentAnswer("");
        setCurrentNotes("");
      } else {
        // Assessment is complete
        onComplete();
        return;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("assessment.errors.loadFailed");
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleNotesChange = (notes: string) => {
    setCurrentNotes(notes);
  };

  const handleNext = async () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      setError(t("assessment.taking.question.required"));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const saveRequest: SaveAnswerRequest = {
        employeeAssessmentId,
        questionId: currentQuestion.id!,
        answeredAt: new Date().toISOString(),
        value: currentAnswer.trim(),
        tenantId: currentQuestion.tenantId,
        notes: currentNotes.trim() || undefined,
      };

      const response =
        await assessmentService.saveAnswerAndGetNext(saveRequest);

      if (response.question) {
        // More questions to answer
        setCurrentQuestion(response.question);
        setProgress({
          current: response.currentProgress,
          total: response.totalQuestions,
        });
        // Reset form state
        setCurrentAnswer("");
        setCurrentNotes("");
      } else {
        // Assessment is complete
        onComplete();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("assessment.errors.saveFailed");
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div
          className="card shadow"
          style={{ maxWidth: "600px", width: "100%" }}
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

  if (error && !currentQuestion) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div
          className="card shadow"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-4"></i>
            <h4>{t("assessment.taking.error")}</h4>
            <p className="text-muted mb-4">{error}</p>
            <button onClick={loadAssessment} className="btn btn-primary">
              <i className="fas fa-redo mr-2"></i>
              {t("assessment.taking.buttons.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Progress Header */}
            <div className="card shadow mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <i className="fas fa-clipboard-check text-primary mr-2"></i>
                    {t("assessment.taking.progress.title")}
                  </h5>
                  <span className="badge badge-primary">
                    {t("assessment.taking.progress.current", { current: progress.current, total: progress.total })}
                  </span>
                </div>
                <div className="progress mb-2" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${getProgressPercentage()}%` }}
                    aria-valuenow={getProgressPercentage()}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <small className="text-muted">
                  {t("assessment.taking.progress.percentage", { percentage: getProgressPercentage() })}
                </small>
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-question-circle mr-2"></i>
                    {t("assessment.taking.question.number", { number: progress.current + 1 })}
                  </h6>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Question Content */}
                  <div className="mb-4">
                    <h5 className="question-text mb-3">
                      {currentQuestion.question}
                    </h5>
                    {currentQuestion.extraDescription && (
                      <p className="text-muted small mb-3">
                        <i className="fas fa-info-circle mr-1"></i>
                        {currentQuestion.extraDescription}
                      </p>
                    )}

                    {/* Category and Pillar Info */}
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>{t("assessment.taking.question.category")}:</strong>{" "}
                        {currentQuestion.categoryName} |
                        <strong className="ml-2">{t("assessment.taking.question.pillar")}:</strong>{" "}
                        {currentQuestion.pillarName}
                      </small>
                    </div>
                  </div>

                  {/* Question Input */}
                  <QuestionRenderer
                    question={currentQuestion}
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                  />

                  {/* Notes Section */}
                  <div className="form-group mt-4">
                    <label htmlFor="notes" className="form-label">
                      <i className="fas fa-sticky-note mr-2"></i>
                      {t("assessment.taking.question.notes")}
                    </label>
                    <textarea
                      id="notes"
                      className="form-control"
                      rows={3}
                      value={currentNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder={t("assessment.taking.question.notesPlaceholder")}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Next Button */}
                  <div className="text-center mt-4">
                    <button
                      onClick={handleNext}
                      disabled={!currentAnswer.trim() || isSaving}
                      className="btn btn-success btn-lg"
                    >
                      {isSaving ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t("assessment.taking.buttons.saving")}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-arrow-right mr-2"></i>
                          {progress.current + 1 === progress.total
                            ? t("assessment.taking.buttons.complete")
                            : t("assessment.taking.buttons.next")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTaking;
