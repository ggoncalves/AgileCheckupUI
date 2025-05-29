import apiService from './apiService';
import { CrudApi } from '../components/common/AbstractCRUD';

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  department: {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    companyId: string;
    createdDate?: string;
    lastUpdatedDate?: string;
  };
}

export type TeamCreateDto = Omit<Team, 'id' | 'createdDate' | 'lastUpdatedDate' | 'department'> & {
  departmentId: string;
  companyId: string;
};
export type TeamUpdateDto = Partial<TeamCreateDto>;

export const teamService: CrudApi<Team> = {
  getAll: async () => {
    return await apiService.get<Team[]>('/teams');
  },

  getById: async (id: string) => {
    return await apiService.get<Team>(`/teams/${id}`);
  },

  create: async (data: TeamCreateDto) => {
    return await apiService.post<Team>('/teams', data);
  },

  update: async (id: string, data: TeamUpdateDto) => {
    return await apiService.put<Team>(`/teams/${id}`, data);
  },

  delete: async (id: string) => {
    await apiService.delete<void>(`/teams/${id}`);
  }
};

// Additional method to get teams by department
export const getTeamsByDepartment = async (departmentId: string): Promise<Team[]> => {
  // Backend supports filtering by departmentId
  return await apiService.get<Team[]>('/teams', {
    params: { departmentId: departmentId }
  });
};