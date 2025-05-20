import axios from 'axios';

export interface Company {
  id: string;
  tenantId: string;
  description: string; // Company's description
  name: string;  // Company name
  email: string; // Company's email
  documentNumber: string; // CNPJ
  createdDate: string;
  lastUpdatedDate: string;
}

// Type for creating a new company
export type CreateCompanyDTO = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating an existing company
export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;

export const companyApi = {
  getAll: async (): Promise<Company[]> => {
    try {
      const response = await axios.get('/api/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Company> => {
    try {
      const response = await axios.get(`/api/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  create: async (companyData: CreateCompanyDTO): Promise<Company> => {
    try {
      const response = await axios.post('/api/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  update: async (id: string, companyData: UpdateCompanyDTO): Promise<Company> => {
    try {
      const response = await axios.put(`/api/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/companies/${id}`);
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};