import apiService from './apiService';

// ==============================
// TypeScript Interfaces
// ==============================

// Performance Cycle Interfaces
export interface PerformanceCycle {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

// Assessment Matrix Interfaces
export interface AssessmentMatrix {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  performanceCycleId: string;
  questionCount?: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

// Dashboard Response Interfaces
export interface TeamSummary {
  teamId: string;
  teamName: string;
  totalEmployees: number;
  completedAssessments: number;
  completionPercentage: number;
  averageScore?: number;
}

export interface EmployeeAssessmentDetail {
  employeeAssessmentId: string;
  employeeName: string;
  employeeEmail: string;
  teamId: string;
  status: string; // COMPLETED, IN_PROGRESS, CONFIRMED, INVITED
  currentScore?: number;
  answeredQuestions?: number;
  lastActivityDate?: string;
}

export interface EmployeePageResponse {
  content: EmployeeAssessmentDetail[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DashboardResponse {
  matrixId: string;
  matrixName: string;
  potentialScore: unknown; // Can be complex object, keeping as unknown for flexibility
  teamSummaries: TeamSummary[];
  employees: EmployeePageResponse;
  totalEmployees: number;
  completedAssessments: number;
}

// Analytics Overview Response Interfaces
export interface PillarSummary {
  name: string;
  percentage: number;
  actualScore: number;
  potentialScore: number;
}

export interface CategorySummary {
  name: string;
  pillar: string;
  percentage: number;
  actualScore: number;
  potentialScore: number;
}

export interface AnalyticsMetadata {
  assessmentMatrixId: string;
  companyName: string;
  performanceCycle: string;
  assessmentMatrixName: string;
  lastUpdated: string;
}

export interface AnalyticsSummary {
  generalAverage: number;
  topPillar: PillarSummary;
  bottomPillar: PillarSummary;
  topCategory: CategorySummary;
  bottomCategory: CategorySummary;
  totalEmployees: number;
  completionPercentage: number;
}

export interface CategoryScore {
  name: string;
  score: number; // Percentage (actualScore/potentialScore * 100)
  actualScore: number;
  potentialScore: number;
  gapFromPotential: number;
}

export interface PillarScore {
  name: string;
  score: number; // Percentage (actualScore/potentialScore * 100)
  actualScore: number;
  potentialScore: number;
  gapFromPotential: number;
  categories: CategoryScore[];
}

export interface TeamOverview {
  teamId: string;
  teamName: string;
  totalScore: number;
  employeeCount: number;
  completionPercentage: number;
  pillarScores: Record<string, PillarScore>;
}

export interface DashboardAnalyticsOverviewResponse {
  metadata: AnalyticsMetadata;
  summary: AnalyticsSummary;
  teams: TeamOverview[];
}

// Team Analytics Response Interfaces
export interface WordFrequency {
  text: string;
  count: number;
}

export interface WordCloud {
  words: WordFrequency[];
  totalResponses: number;
  status: 'sufficient' | 'limited' | 'none';
}

export interface DashboardAnalyticsTeamResponse {
  teamId: string;
  teamName: string;
  totalScore: number;
  employeeCount: number;
  completionPercentage: number;
  pillarScores: Record<string, PillarScore>;
  wordCloud: WordCloud;
}

// ==============================
// Dashboard Analytics Service
// ==============================

export const dashboardAnalyticsService = {
  /**
   * Get all Performance Cycles for a company
   * @param companyId - The company/tenant ID
   * @returns Promise<PerformanceCycle[]>
   */
  getPerformanceCycles: async (companyId: string): Promise<PerformanceCycle[]> => {
    try {
      const response = await apiService.get<PerformanceCycle[]>(
        '/performancecycles', 
        { params: { tenantId: companyId } }
      );
      return response;
    } catch (error) {
      console.error('Error fetching performance cycles:', error);
      throw error;
    }
  },

  /**
   * Get all Assessment Matrices for a company
   * @param companyId - The company/tenant ID
   * @returns Promise<AssessmentMatrix[]>
   */
  getAssessmentMatrices: async (companyId: string): Promise<AssessmentMatrix[]> => {
    try {
      const response = await apiService.get<AssessmentMatrix[]>(
        '/assessmentmatrices', 
        { params: { tenantId: companyId } }
      );
      return response;
    } catch (error) {
      console.error('Error fetching assessment matrices:', error);
      throw error;
    }
  },

  /**
   * Get dashboard data for a specific Assessment Matrix
   * @param matrixId - Assessment Matrix ID
   * @param page - Page number for pagination (default: 1)
   * @param pageSize - Number of items per page (default: 50)
   * @returns Promise<DashboardResponse>
   */
  getAssessmentMatrixDashboard: async (
    matrixId: string, 
    page: number = 1, 
    pageSize: number = 50
  ): Promise<DashboardResponse> => {
    try {
      const response = await apiService.get<DashboardResponse>(
        `/assessmentmatrices/${matrixId}/dashboard`,
        { 
          params: { 
            page, 
            pageSize 
          }
        }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching dashboard data for matrix ${matrixId}:`, error);
      throw error;
    }
  },

  /**
   * Get overview analytics for an Assessment Matrix
   * @param assessmentMatrixId - Assessment Matrix ID
   * @returns Promise<DashboardAnalyticsOverviewResponse>
   */
  getDashboardOverview: async (assessmentMatrixId: string): Promise<DashboardAnalyticsOverviewResponse> => {
    try {
      const response = await apiService.get<DashboardAnalyticsOverviewResponse>(
        `/dashboard-analytics/overview/${assessmentMatrixId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching dashboard overview for matrix ${assessmentMatrixId}:`, error);
      throw error;
    }
  },

  /**
   * Get detailed analytics for a specific team
   * @param assessmentMatrixId - Assessment Matrix ID
   * @param teamId - Team ID
   * @returns Promise<DashboardAnalyticsTeamResponse>
   */
  getTeamAnalytics: async (
    assessmentMatrixId: string, 
    teamId: string
  ): Promise<DashboardAnalyticsTeamResponse> => {
    try {
      const response = await apiService.get<DashboardAnalyticsTeamResponse>(
        `/dashboard-analytics/team/${assessmentMatrixId}/${teamId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching team analytics for team ${teamId} in matrix ${assessmentMatrixId}:`, error);
      throw error;
    }
  },

  /**
   * Trigger analytics computation for a specific Assessment Matrix
   * @param assessmentMatrixId - Assessment Matrix ID
   * @returns Promise<unknown> - Success/failure response
   */
  computeAnalytics: async (assessmentMatrixId: string): Promise<unknown> => {
    try {
      const response = await apiService.post<unknown>(
        `/dashboard-analytics/compute/${assessmentMatrixId}`,
        {}, // Empty body, tenantId added automatically by interceptor
        {}  // Empty config
      );
      return response;
    } catch (error) {
      console.error(`Error computing analytics for matrix ${assessmentMatrixId}:`, error);
      throw error;
    }
  }
};

export default dashboardAnalyticsService;