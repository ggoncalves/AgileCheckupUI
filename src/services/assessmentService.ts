import apiService from './apiService';
import { Question } from './questionService';

export interface Answer {
  id?: string;
  employeeAssessmentId: string;
  questionId: string;
  pillarId: string;
  categoryId: string;
  questionType: string;
  question: Question;
  value: string;
  score: number;
  notes?: string;
  answeredAt: string;
  pendingReview: boolean;
  reviewer?: string;
  tenantId: string;
}

export interface AnswerWithProgressResponse {
  question: Question | null;
  existingAnswer: Answer | null;
  currentProgress: number;
  totalQuestions: number;
}

export interface EmployeeAssessment {
  id: string;
  assessmentMatrixId: string;
  employee: {
    name: string;
    email: string;
  };
  teamId?: string;
  answeredQuestionCount: number;
  employeeAssessmentScore: {
    overallScore: number;
    pillarScores: { [pillarId: string]: number };
  };
  assessmentStatus: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAnswerRequest {
  employeeAssessmentId: string;
  questionId: string;
  answeredAt: string;
  value: string;
  tenantId: string;
  notes?: string;
}

class AssessmentService {
  /**
   * Get the next unanswered question for an employee assessment
   */
  async getNextQuestion(employeeAssessmentId: string, tenantId: string): Promise<AnswerWithProgressResponse> {
    return await apiService.get<AnswerWithProgressResponse>(
      `/questions/next?employeeAssessmentId=${employeeAssessmentId}&tenantId=${tenantId}`
    );
  }

  /**
   * Save an answer and get the next unanswered question in one call
   */
  async saveAnswerAndGetNext(request: SaveAnswerRequest): Promise<AnswerWithProgressResponse> {
    return await apiService.post<AnswerWithProgressResponse>('/answers/save-and-next', request);
  }

  /**
   * Get employee assessment details
   */
  async getEmployeeAssessment(id: string): Promise<EmployeeAssessment> {
    return await apiService.get<EmployeeAssessment>(`/employeeassessments/${id}`);
  }

  /**
   * Get all answers for an employee assessment
   */
  async getAnswers(employeeAssessmentId: string): Promise<Answer[]> {
    return await apiService.get<Answer[]>(`/answers/employeeassessment/${employeeAssessmentId}`);
  }
}

const assessmentService = new AssessmentService();
export default assessmentService;