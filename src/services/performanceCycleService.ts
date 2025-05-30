import apiService from './apiService';
import { CrudApi } from '../components/common/AbstractCRUD';

export interface PerformanceCycle {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isTimeSensitive: boolean;
  startDate?: string;
  endDate?: string;
  createdDate?: string;
  lastUpdatedDate?: string;
}

export type PerformanceCycleCreateDto = Omit<PerformanceCycle, 'id' | 'createdDate' | 'lastUpdatedDate'>;
export type PerformanceCycleUpdateDto = Partial<PerformanceCycleCreateDto>;

export const performanceCycleService: CrudApi<PerformanceCycle> = {
  getAll: async () => {
    return await apiService.get<PerformanceCycle[]>('/performancecycles');
  },

  getById: async (id: string) => {
    return await apiService.get<PerformanceCycle>(`/performancecycles/${id}`);
  },

  create: async (data: PerformanceCycleCreateDto) => {
    return await apiService.post<PerformanceCycle>('/performancecycles', data);
  },

  update: async (id: string, data: PerformanceCycleUpdateDto) => {
    return await apiService.put<PerformanceCycle>(`/performancecycles/${id}`, data);
  },

  delete: async (id: string) => {
    await apiService.delete<void>(`/performancecycles/${id}`);
  }
};