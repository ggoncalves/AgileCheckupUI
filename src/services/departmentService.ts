import apiService from './apiService';

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  companyId: string;
  createdDate: string;
  lastUpdatedDate: string;
  // Index signature for CrudItem compatibility
  [key: string]: unknown;
}

// Type for creating a new department
export type CreateDepartmentDTO = Omit<Department, 'id' | 'createdDate' | 'lastUpdatedDate'>;

// Type for updating an existing department
export type UpdateDepartmentDTO = Partial<CreateDepartmentDTO>;

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    return apiService.get('/departments');
  },

  getById: async (id: string): Promise<Department> => {
    return apiService.get(`/departments/${id}`);
  },

  create: async (departmentData: CreateDepartmentDTO): Promise<Department> => {
    return apiService.post('/departments', departmentData);
  },

  update: async (id: string, departmentData: UpdateDepartmentDTO): Promise<Department> => {
    return apiService.put(`/departments/${id}`, departmentData);
  },

  delete: async (id: string): Promise<void> => {
    return apiService.delete(`/departments/${id}`);
  }
};