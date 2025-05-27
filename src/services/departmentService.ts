import axios from 'axios';

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  companyId: string;
  createdDate: string;
  lastUpdatedDate: string;
}

// Type for creating a new department
export type CreateDepartmentDTO = Omit<Department, 'id' | 'createdDate' | 'lastUpdatedDate'>;

// Type for updating an existing department
export type UpdateDepartmentDTO = Partial<CreateDepartmentDTO>;

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    try {
      const response = await axios.get('/api/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Department> => {
    try {
      const response = await axios.get(`/api/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error);
      throw error;
    }
  },

  create: async (departmentData: CreateDepartmentDTO): Promise<Department> => {
    try {
      const response = await axios.post('/api/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  update: async (id: string, departmentData: UpdateDepartmentDTO): Promise<Department> => {
    try {
      const response = await axios.put(`/api/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating department ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/departments/${id}`);
    } catch (error) {
      console.error(`Error deleting department ${id}:`, error);
      throw error;
    }
  }
};