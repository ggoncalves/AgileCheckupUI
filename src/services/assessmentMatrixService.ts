import apiService from './apiService';
import { CrudApi } from '@/components/common/AbstractCRUD';

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

export interface AssessmentMatrix {
  id: string;
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