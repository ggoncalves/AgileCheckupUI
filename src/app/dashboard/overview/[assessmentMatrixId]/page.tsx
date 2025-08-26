"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TenantProtected } from "@/infrastructure/auth";
import { AdminLayout } from "@/infrastructure/layouts";
import { useTenant } from "@/infrastructure/auth";
import dashboardAnalyticsService, {
  DashboardAnalyticsOverviewResponse,
} from "@/services/dashboardAnalyticsService";
import RadarChart from "@/components/charts/RadarChart";
import { transformPillarScoresToChartData } from "@/utils/chartUtils";
import { DASHBOARD_COLORS } from "@/styles/dashboardColors";

const DashboardOverview: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const assessmentMatrixId = params.assessmentMatrixId as string;
  const {} = useTenant();

  // Get matrix name from sessionStorage
  const [matrixName, setMatrixName] = useState<string>("");
  const [overviewData, setOverviewData] =
    useState<DashboardAnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  const loadOverviewData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data =
        await dashboardAnalyticsService.getDashboardOverview(
          assessmentMatrixId,
        );
      setOverviewData(data);
    } catch (err) {
      console.error("Error loading overview data:", err);
      setError(t("dashboard.overview.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [assessmentMatrixId, t]);

  useEffect(() => {
    // Get matrix name from sessionStorage
    const storedName = sessionStorage.getItem(
      `matrix_${assessmentMatrixId}_name`,
    );
    if (storedName) {
      setMatrixName(storedName);
    }

    // Load overview data
    loadOverviewData();
  }, [assessmentMatrixId, loadOverviewData]);

  const handleRecreateDashboard = async () => {
    setShowConfirmModal(false);
    setShowProcessingModal(true);
    setIsComputing(true);

    try {
      await dashboardAnalyticsService.computeAnalytics(assessmentMatrixId);

      // Show success message briefly before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error recreating dashboard:", error);
      setShowProcessingModal(false);
      setIsComputing(false);
      // Show error in an alert for simplicity
      alert(t("dashboard.overview.recreateDashboard.error"));
    }
  };

  return (
    <TenantProtected>
      <AdminLayout>
        {/* Content Header (Page header) */}
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">{t("dashboard.overview.title")}</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="/dashboard">{t("dashboard.title")}</a>
                  </li>
                  <li className="breadcrumb-item active">
                    {t("dashboard.overview.breadcrumb")}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-clipboard-check mr-2"></i>
                      {matrixName || t("dashboard.overview.defaultMatrixName")}
                    </h3>
                    <div className="card-tools">
                      <button
                        type="button"
                        className="btn btn-sm btn-warning mr-2"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isComputing || loading}
                      >
                        <i className="fas fa-sync-alt mr-1"></i>
                        {isComputing
                          ? t("dashboard.overview.buttons.recreatingDashboard")
                          : t("dashboard.overview.buttons.recreateDashboard")}
                      </button>
                      <button
                        type="button"
                        className="btn btn-tool"
                        data-card-widget="collapse"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {loading && (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary mb-3"
                          role="status"
                        >
                          <span className="sr-only">
                            {t("common.status.loading")}
                          </span>
                        </div>
                        <h5 className="text-muted">
                          {t("dashboard.overview.loading.title")}
                        </h5>
                        <p className="text-muted">
                          {t("dashboard.overview.loading.subtitle")}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="alert alert-danger">
                        <h5>
                          <i className="icon fas fa-ban"></i>{" "}
                          {t("common.status.error")}!
                        </h5>
                        {error}
                        <div className="mt-2">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={loadOverviewData}
                          >
                            <i className="fas fa-redo"></i>{" "}
                            {t("dashboard.buttons.retry")}
                          </button>
                        </div>
                      </div>
                    )}

                    {!loading && !error && overviewData && (
                      <div>
                        {/* Company and Performance Cycle Info */}
                        <div className="row mb-4">
                          <div className="col-12">
                            <div className="alert alert-info">
                              <h6 className="mb-2">
                                <i className="fas fa-building mr-2"></i>
                                {overviewData.metadata.companyName}
                              </h6>
                              <p className="mb-0">
                                <strong>
                                  {t("dashboard.overview.performanceCycle")}:
                                </strong>{" "}
                                {overviewData.metadata.performanceCycle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Overall Comparison Chart */}
                        {overviewData.teams &&
                          overviewData.teams.length > 1 && (
                            <div className="row mb-4">
                              <div className="col-12">
                                <div className="card">
                                  <div className="card-header">
                                    <h5 className="card-title mb-0">
                                      <i className="fas fa-chart-radar mr-2"></i>
                                      {t(
                                        "dashboard.overview.teamComparisonTitle",
                                      )}
                                    </h5>
                                  </div>
                                  <div className="card-body">
                                    <RadarChart
                                      entities={overviewData.teams
                                        .filter(
                                          (team) =>
                                            team.pillarScores &&
                                            Object.keys(team.pillarScores)
                                              .length > 0,
                                        )
                                        .map((team, index) => ({
                                          entityId: team.teamId,
                                          entityName: team.teamName,
                                          data: transformPillarScoresToChartData(
                                            team.pillarScores,
                                          ),
                                          color:
                                            DASHBOARD_COLORS.radar.primary[
                                              index %
                                                DASHBOARD_COLORS.radar.primary
                                                  .length
                                            ],
                                        }))}
                                      height={400}
                                      showLegend={true}
                                      animate={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Team Cards Grid */}
                        <div className="row">
                          {overviewData.teams &&
                          overviewData.teams.length > 0 ? (
                            overviewData.teams.map((team, index) => (
                              <div
                                key={team.teamId}
                                className="col-lg-4 col-md-6 mb-4"
                              >
                                <div className="card">
                                  <div className="card-header">
                                    <h5 className="card-title mb-0">
                                      {team.teamName}
                                    </h5>
                                  </div>
                                  <div className="card-body">
                                    {/* Radar Chart */}
                                    {team.pillarScores &&
                                    Object.keys(team.pillarScores).length >
                                      0 ? (
                                      <RadarChart
                                        entities={[
                                          {
                                            entityId: team.teamId,
                                            entityName: team.teamName,
                                            data: transformPillarScoresToChartData(
                                              team.pillarScores,
                                            ),
                                            color:
                                              DASHBOARD_COLORS.radar.primary[
                                                index %
                                                  DASHBOARD_COLORS.radar.primary
                                                    .length
                                              ],
                                          },
                                        ]}
                                        height={250}
                                        showLegend={false}
                                        animate={true}
                                      />
                                    ) : (
                                      <div className="text-center py-4">
                                        <i
                                          className="fas fa-chart-radar text-muted mb-2"
                                          style={{ fontSize: "2rem" }}
                                        ></i>
                                        <p className="text-muted mb-1">
                                          {t(
                                            "dashboard.overview.noPillarAnalysis",
                                          )}
                                        </p>
                                        <small className="text-muted">
                                          {team.pillarScores
                                            ? t(
                                                "dashboard.overview.pillarsFound",
                                                {
                                                  count: Object.keys(
                                                    team.pillarScores,
                                                  ).length,
                                                },
                                              )
                                            : t(
                                                "dashboard.overview.noPillarData",
                                              )}
                                        </small>
                                        <div className="mt-3">
                                          <div
                                            className="progress"
                                            style={{ height: "8px" }}
                                          >
                                            <div
                                              className="progress-bar bg-info"
                                              style={{
                                                width: `${team.completionPercentage}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <small className="text-muted mt-1 d-block">
                                            {t(
                                              "dashboard.overview.assessmentProgress",
                                            )}
                                            : {team.completionPercentage}%
                                          </small>
                                        </div>
                                      </div>
                                    )}

                                    {/* Team Statistics */}
                                    <div className="mt-3">
                                      <div className="row text-center">
                                        <div className="col-4">
                                          <div className="small text-muted">
                                            {t(
                                              "dashboard.overview.stats.employees",
                                            )}
                                          </div>
                                          <div className="font-weight-bold">
                                            {team.employeeCount}
                                          </div>
                                        </div>
                                        <div className="col-4">
                                          <div className="small text-muted">
                                            {t(
                                              "dashboard.overview.stats.score",
                                            )}
                                          </div>
                                          <div className="font-weight-bold">
                                            {team.totalScore}%
                                          </div>
                                        </div>
                                        <div className="col-4">
                                          <div className="small text-muted">
                                            {t(
                                              "dashboard.overview.stats.completion",
                                            )}
                                          </div>
                                          <div className="font-weight-bold">
                                            {team.completionPercentage}%
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* View Details Button */}
                                    <div className="mt-3 text-center">
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                          // Store team name for breadcrumb
                                          sessionStorage.setItem(
                                            `team_${team.teamId}_name`,
                                            team.teamName,
                                          );
                                          // Navigate to team detail
                                          router.push(
                                            `/dashboard/team/${assessmentMatrixId}/${team.teamId}`,
                                          );
                                        }}
                                      >
                                        <i className="fas fa-chart-line mr-1"></i>
                                        {t(
                                          "dashboard.overview.buttons.viewDetails",
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-12">
                              <div className="alert alert-warning">
                                <h5>
                                  <i className="icon fas fa-exclamation-triangle"></i>{" "}
                                  {t("dashboard.overview.noTeams.title")}
                                </h5>
                                {t("dashboard.overview.noTeams.description")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!loading && !error && !overviewData && (
                      <div className="alert alert-warning">
                        <h5>
                          <i className="icon fas fa-exclamation-triangle"></i>{" "}
                          {t("dashboard.overview.noData.title")}
                        </h5>
                        {t("dashboard.overview.noData.description")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                    {t("dashboard.overview.recreateDashboard.title")}
                  </h4>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <p className="mb-2">
                      {t("dashboard.overview.recreateDashboard.warning")}
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-clock mr-1"></i>
                      {t("dashboard.overview.recreateDashboard.timeWarning")}
                    </p>
                  </div>
                  <p>
                    {t("dashboard.overview.recreateDashboard.confirmMessage")}
                  </p>
                </div>
                <div className="modal-footer justify-content-between">
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    {t("dashboard.overview.recreateDashboard.cancel")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleRecreateDashboard}
                  >
                    <i className="fas fa-sync-alt mr-1"></i>
                    {t("dashboard.overview.recreateDashboard.confirm")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Modal */}
        {showProcessingModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    <i className="fas fa-sync-alt fa-spin mr-2"></i>
                    {t("dashboard.overview.recreateDashboard.processingTitle")}
                  </h4>
                </div>
                <div className="modal-body text-center">
                  <div
                    className="spinner-border text-warning mb-3"
                    style={{ width: "3rem", height: "3rem" }}
                    role="status"
                  >
                    <span className="sr-only">
                      {t("common.status.loading")}
                    </span>
                  </div>
                  <p className="mb-2">
                    {t(
                      "dashboard.overview.recreateDashboard.processingMessage",
                    )}
                  </p>
                  <p className="text-muted">
                    <i className="fas fa-info-circle mr-1"></i>
                    {t("dashboard.overview.recreateDashboard.doNotClose")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </TenantProtected>
  );
};

export default DashboardOverview;
