import apiService from './apiService';

export interface NaturalPerson {
  id?: string;
  name: string;
  email: string;
  documentNumber?: string;
  personDocumentType?: 'CPF' | 'CNPJ' | 'PASSPORT' | 'OTHER';
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  genderPronoun?: 'HE' | 'SHE' | 'THEY' | 'OTHER';
}

export interface EmployeeAssessmentScore {
  score: number;
  pillarIdToPillarScoreMap?: any;
}

export interface EmployeeAssessment {
  id?: string;
  tenantId?: string;
  assessmentMatrixId: string;
  employee: NaturalPerson;
  teamId?: string;
  assessmentStatus?: 'INVITED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  answeredQuestionCount?: number;
  employeeAssessmentScore?: EmployeeAssessmentScore;
  createdDate?: string;
  lastUpdatedDate?: string;
  // Index signature for CrudItem compatibility
  [key: string]: unknown;
}

// Type for creating a new employee assessment
export type CreateEmployeeAssessmentDTO = Omit<EmployeeAssessment, 'id' | 'createdDate' | 'lastUpdatedDate'>;

// Type for updating an existing employee assessment
export type UpdateEmployeeAssessmentDTO = Partial<CreateEmployeeAssessmentDTO>;

export const employeeAssessmentService = {
  getAll: async (): Promise<EmployeeAssessment[]> => {
    return apiService.get<EmployeeAssessment[]>('/employeeassessments');
  },

  getById: async (id: string): Promise<EmployeeAssessment> => {
    return apiService.get<EmployeeAssessment>(`/employeeassessments/${id}`);
  },

  create: async (assessmentData: CreateEmployeeAssessmentDTO): Promise<EmployeeAssessment> => {
    return apiService.post<EmployeeAssessment>('/employeeassessments', assessmentData);
  },

  update: async (id: string, assessmentData: UpdateEmployeeAssessmentDTO): Promise<EmployeeAssessment> => {
    return apiService.put<EmployeeAssessment>(`/employeeassessments/${id}`, assessmentData);
  },

  delete: async (id: string): Promise<void> => {
    return apiService.delete<void>(`/employeeassessments/${id}`);
  },

  // Additional method to get assessments by assessment matrix
  getByAssessmentMatrix: async (assessmentMatrixId: string): Promise<EmployeeAssessment[]> => {
    return apiService.get<EmployeeAssessment[]>('/employeeassessments', {
      params: { assessmentMatrixId }
    });
  },

  // Method to check for duplicate email in assessment matrix
  checkDuplicate: async (email: string, assessmentMatrixId: string): Promise<boolean> => {
    try {
      const assessments = await employeeAssessmentService.getByAssessmentMatrix(assessmentMatrixId);
      return assessments.some(assessment => 
        assessment.employee.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  },

  // Method to update assessment score
  updateScore: async (id: string): Promise<EmployeeAssessment> => {
    return apiService.post<EmployeeAssessment>(`/employeeassessments/${id}/score`);
  }
};