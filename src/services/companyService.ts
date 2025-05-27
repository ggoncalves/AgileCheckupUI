import axios from 'axios';

// Enums matching backend
export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL', 
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE'
}

export enum Industry {
  TECHNOLOGY = 'TECHNOLOGY',
  FINANCE = 'FINANCE',
  HEALTHCARE = 'HEALTHCARE',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  EDUCATION = 'EDUCATION',
  CONSULTING = 'CONSULTING',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
  OTHER = 'OTHER'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  GENDERQUEER = 'GENDERQUEER',
  TRANSGENDER = 'TRANSGENDER',
  INTERSEX = 'INTERSEX',
  OTHER = 'OTHER'
}

export enum GenderPronoun {
  HE = 'HE',
  SHE = 'SHE'
}

export interface NaturalPerson {
  name: string;
  email: string;
  phone?: string;
  documentNumber: string; // CPF
  personDocumentType: 'CPF';
  gender: Gender;
  genderPronoun: GenderPronoun;
}

export interface Company {
  id: string;
  tenantId: string;
  description: string; // Company's description
  name: string;  // Company name
  email: string; // Company's email
  documentNumber: string; // CNPJ
  phone?: string; // Company's phone
  // New enhanced fields
  size: CompanySize;
  industry: Industry;
  website?: string;
  legalName?: string;
  contactPerson?: NaturalPerson;
  address?: Address;
  // Audit fields
  createdDate: string;
  lastUpdatedDate: string;
  // Index signature for CrudItem compatibility
  [key: string]: unknown;
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

// Helper functions for display
export const getCompanySizeLabel = (size: CompanySize): string => {
  const labels: Record<CompanySize, string> = {
    [CompanySize.STARTUP]: 'Startup (1-10 employees)',
    [CompanySize.SMALL]: 'Small (11-50 employees)', 
    [CompanySize.MEDIUM]: 'Medium (51-200 employees)',
    [CompanySize.LARGE]: 'Large (201-1000 employees)',
    [CompanySize.ENTERPRISE]: 'Enterprise (1000+ employees)'
  };
  return labels[size] || size;
};

export const getIndustryLabel = (industry: Industry): string => {
  const labels: Record<Industry, string> = {
    [Industry.TECHNOLOGY]: 'Technology',
    [Industry.FINANCE]: 'Finance',
    [Industry.HEALTHCARE]: 'Healthcare',
    [Industry.MANUFACTURING]: 'Manufacturing',
    [Industry.RETAIL]: 'Retail',
    [Industry.EDUCATION]: 'Education',
    [Industry.CONSULTING]: 'Consulting',
    [Industry.GOVERNMENT]: 'Government',
    [Industry.NONPROFIT]: 'Nonprofit',
    [Industry.OTHER]: 'Other'
  };
  return labels[industry] || industry;
};

export const getGenderLabel = (gender: Gender): string => {
  const labels: Record<Gender, string> = {
    [Gender.MALE]: 'Male',
    [Gender.FEMALE]: 'Female',
    [Gender.NON_BINARY]: 'Non-binary',
    [Gender.GENDERQUEER]: 'Genderqueer',
    [Gender.TRANSGENDER]: 'Transgender',
    [Gender.INTERSEX]: 'Intersex',
    [Gender.OTHER]: 'Other'
  };
  return labels[gender] || gender;
};

export const getGenderPronounLabel = (pronoun: GenderPronoun): string => {
  const labels: Record<GenderPronoun, string> = {
    [GenderPronoun.HE]: 'He/Him',
    [GenderPronoun.SHE]: 'She/Her'
  };
  return labels[pronoun] || pronoun;
};