import apiService from './apiService';

export interface QuestionOption {
  id: number;
  text: string;
  points: number;
}

export interface OptionGroup {
  isMultipleChoice: boolean;
  showFlushed: boolean;
  optionMap: { [key: number]: QuestionOption };
}

export interface Question {
  id?: string;
  tenantId: string;
  assessmentMatrixId: string;
  pillarId: string;
  pillarName: string;
  categoryId: string;
  categoryName: string;
  question: string;
  extraDescription?: string;
  points?: number;
  questionType: QuestionType;
  optionGroup?: OptionGroup;
  createdAt?: string;
  updatedAt?: string;
}

export enum QuestionType {
  STAR_THREE = 'STAR_THREE',
  STAR_FIVE = 'STAR_FIVE',
  ONE_TO_TEN = 'ONE_TO_TEN',
  YES_NO = 'YES_NO',
  GOOD_BAD = 'GOOD_BAD',
  OPEN_ANSWER = 'OPEN_ANSWER',
  CUSTOMIZED = 'CUSTOMIZED'
}

export interface QuestionFormData {
  question: string;
  questionType: QuestionType;
  tenantId: string;
  points?: number;
  assessmentMatrixId: string;
  pillarId: string;
  categoryId: string;
  extraDescription?: string;
  // For custom questions
  isMultipleChoice?: boolean;
  showFlushed?: boolean;
  options?: QuestionOption[];
}

class QuestionService {
  async getAll(): Promise<Question[]> {
    return await apiService.get<Question[]>(`/questions`);
  }

  async getByAssessmentMatrix(matrixId: string): Promise<Question[]> {
    const response = await apiService.get<Question[]>(`/questions/matrix/${matrixId}`);
    return response;
  }

  async getById(id: string): Promise<Question> {
    return await apiService.get<Question>(`/questions/${id}`);
  }

  async create(data: QuestionFormData): Promise<Question> {
    return await apiService.post<Question>('/questions', data);
  }

  async createCustom(data: QuestionFormData): Promise<Question> {
    return await apiService.post<Question>('/questions/custom', data);
  }

  async update(id: string, data: QuestionFormData): Promise<Question> {
    return await apiService.put<Question>(`/questions/${id}`, data);
  }

  async updateCustom(id: string, data: QuestionFormData): Promise<Question> {
    return await apiService.put<Question>(`/questions/${id}/custom`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`/questions/${id}`);
  }
}

const questionService = new QuestionService();
export default questionService;