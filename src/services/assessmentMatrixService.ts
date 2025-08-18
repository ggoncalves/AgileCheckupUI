import apiService from './apiService';
import { CrudApi, CrudItem } from '@/components/common/AbstractCRUD';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Pillar {
  id: string;
  name: string;
  description?: string;
  categoryMap: { [key: string]: Category };
}

export interface AssessmentMatrix extends CrudItem {
  tenantId: string;
  name: string;
  description?: string;
  performanceCycleId: string;
  pillarMap: { [key: string]: Pillar };
  questionCount?: number;
  potentialScore?: unknown;
  createdDate?: string;
  lastUpdatedDate?: string;
}

// Dashboard Types
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
  teamId?: string;
  status: string;
  currentScore?: number;
  answeredQuestions: number;
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
  potentialScore?: unknown;
  teamSummaries: TeamSummary[];
  employees: EmployeePageResponse;
  totalEmployees: number;
  completedAssessments: number;
}

export type AssessmentMatrixCreateDto = Omit<AssessmentMatrix, 'id' | 'createdDate' | 'lastUpdatedDate' | 'questionCount' | 'potentialScore'>;
export type AssessmentMatrixUpdateDto = Partial<AssessmentMatrixCreateDto>;

export const assessmentMatrixService: CrudApi<AssessmentMatrix> = {
  getAll: async () => {
    return await apiService.get<AssessmentMatrix[]>('/assessmentmatrices');
  },
  
  getById: async (id: string) => {
    return await apiService.get<AssessmentMatrix>(`/assessmentmatrices/${id}`);
  },
  
  create: async (data: AssessmentMatrixCreateDto) => {
    return await apiService.post<AssessmentMatrix>('/assessmentmatrices', data);
  },
  
  update: async (id: string, data: AssessmentMatrixUpdateDto) => {
    return await apiService.put<AssessmentMatrix>(`/assessmentmatrices/${id}`, data);
  },
  
  delete: async (id: string) => {
    await apiService.delete<void>(`/assessmentmatrices/${id}`);
  },
};

// Dashboard API
export const getDashboard = async (matrixId: string, page: number = 1, pageSize: number = 50): Promise<DashboardResponse> => {
  return await apiService.get<DashboardResponse>(`/assessmentmatrices/${matrixId}/dashboard`, {
    page: page.toString(),
    pageSize: pageSize.toString()
  });
};