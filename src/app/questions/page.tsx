'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/infrastructure/auth';
import { TenantProtected } from '@/infrastructure/auth';
import { AdminLayout } from '@/infrastructure/layouts';
import questionService, { Question, QuestionType } from '@/services/questionService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { assessmentMatrixService, AssessmentMatrix } from '@/services/assessmentMatrixService';
import QuestionForm from '@/components/questions/QuestionForm';
import QuestionPreviewModal from '@/components/questions/QuestionPreviewModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import styles from './questions.module.css';

export default function QuestionsPage() {
  const { t } = useTranslation();
  const { tenantId } = useTenant();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [assessmentMatrices, setAssessmentMatrices] = useState<AssessmentMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Filters
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>('');
  const [selectedPillarId, setSelectedPillarId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Derived data
  const selectedMatrix = assessmentMatrices.find(m => m.id === selectedMatrixId);
  const pillars = selectedMatrix ? Object.values(selectedMatrix.pillarMap || {}) : [];
  const selectedPillar = pillars.find(p => p.id === selectedPillarId);
  const categories = selectedPillar ? Object.values(selectedPillar.categoryMap || {}) : [];

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [cyclesData, matricesData] = await Promise.all([
        performanceCycleService.getAll(tenantId!),
        assessmentMatrixService.getAll(tenantId!)
      ]);
      setPerformanceCycles(cyclesData);
      setAssessmentMatrices(matricesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const loadQuestions = useCallback(async () => {
    if (!selectedMatrixId || !tenantId) {
      setQuestions([]);
      return;
    }
    try {
      const data = await questionService.getByAssessmentMatrix(selectedMatrixId);
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    }
  }, [selectedMatrixId, tenantId]);

  useEffect(() => {
    if (tenantId) {
      loadInitialData();
    }
  }, [tenantId, loadInitialData]);

  useEffect(() => {
    loadQuestions();
  }, [selectedMatrixId, tenantId, loadQuestions]);

  const handleAdd = (isCustom: boolean = false) => {
    setSelectedQuestion(null);
    setIsCustomQuestion(isCustom);
    setShowForm(true);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsCustomQuestion(question.questionType === QuestionType.CUSTOMIZED);
    setShowForm(true);
  };

  const handlePreview = (question: Question) => {
    setSelectedQuestion(question);
    setShowPreview(true);
  };

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (selectedQuestion?.id) {
      try {
        await questionService.delete(selectedQuestion.id);
        
        // Show success toast
        setToastMessage(t('question.messages.deleteSuccess', { question: selectedQuestion.question }));
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        await loadQuestions();
        setShowDeleteConfirm(false);
        setSelectedQuestion(null);
      } catch (error) {
        console.error('Error deleting question:', error);
        
        // Show error toast
        setToastMessage(t('question.messages.deleteFailed'));
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedQuestion(null);
  };

  const handleFormSuccess = (message?: string) => {
    setShowForm(false);
    setSelectedQuestion(null);
    loadQuestions();
    
    // Show toast if message provided
    if (message) {
      setToastMessage(message);
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };
  
  const handleFormError = (message: string) => {
    // Show error toast
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const getQuestionTypeBadge = (type: QuestionType) => {
    const badges: Record<QuestionType, { color: string; icon: string; label: string }> = {
      [QuestionType.YES_NO]: { color: 'primary', icon: '✓', label: t('question.types.yesNo') },
      [QuestionType.STAR_THREE]: { color: 'warning', icon: '★', label: t('question.types.star3') },
      [QuestionType.STAR_FIVE]: { color: 'success', icon: '★', label: t('question.types.star5') },
      [QuestionType.ONE_TO_TEN]: { color: 'info', icon: '#', label: t('question.types.oneToTen') },
      [QuestionType.GOOD_BAD]: { color: 'secondary', icon: '±', label: t('question.types.goodBad') },
      [QuestionType.OPEN_ANSWER]: { color: 'danger', icon: '✎', label: t('question.types.openAnswer') },
      [QuestionType.CUSTOMIZED]: { color: 'warning', icon: '⚙', label: t('question.types.customized') }
    };
    
    const badge = badges[type];
    return (
      <span className={`badge badge-${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getFilteredQuestions = () => {
    if (!questions || questions.length === 0) return [];
    return questions.filter(q => {
      if (selectedPillarId && q.pillarId !== selectedPillarId) return false;
      if (selectedCategoryId && q.categoryId !== selectedCategoryId) return false;
      return true;
    });
  };

  const groupQuestionsByCategory = () => {
    const filtered = getFilteredQuestions();
    const grouped: Record<string, { pillar: string; category: string; questions: Question[] }> = {};
    
    filtered.forEach(q => {
      const key = `${q.pillarId}-${q.categoryId}`;
      if (!grouped[key]) {
        grouped[key] = {
          pillar: q.pillarName,
          category: q.categoryName,
          questions: []
        };
      }
      grouped[key].questions.push(q);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <TenantProtected>
        <AdminLayout>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">{t('common.status.loading')}</span>
            </div>
          </div>
        </AdminLayout>
      </TenantProtected>
    );
  }

  const groupedQuestions = groupQuestionsByCategory();

  return (
    <TenantProtected>
      <AdminLayout>
        {/* Toast Notification */}
        {showToast && (
          <div className="toast show position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
            <div className={`toast-header bg-${toastType} text-white`}>
              <i className={`fas fa-${toastType === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2`}></i>
              <strong className="mr-auto">{toastType === 'success' ? t('common.status.success') : t('common.status.error')}</strong>
              <button type="button" className="ml-2 mb-1 close text-white" onClick={() => setShowToast(false)}>
                <span>&times;</span>
              </button>
            </div>
            <div className="toast-body">
              {toastMessage}
            </div>
          </div>
        )}
        
        <div className="questions-page">
          {/* Header */}
          <div className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1 className="m-0">
                    <i className="fas fa-question-circle mr-2"></i>
                    {t('question.title')}
                  </h1>
                </div>
                <div className="col-sm-6">
                  <div className="float-sm-right">
                    <div className="btn-group">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAdd(false)}
                        disabled={!selectedMatrixId}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        {t('question.buttons.addStandard')}
                      </button>
                      <button 
                        className="btn btn-warning"
                        onClick={() => handleAdd(true)}
                        disabled={!selectedMatrixId}
                      >
                        <i className="fas fa-cog mr-2"></i>
                        {t('question.buttons.addCustom')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="content">
            <div className="container-fluid">
              <div className="card card-outline card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-filter mr-2"></i>
                    {t('question.filters.title')}
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>{t('question.filters.performanceCycle')}</label>
                        <select
                          className="form-control"
                          value={selectedCycleId}
                          onChange={(e) => setSelectedCycleId(e.target.value)}
                        >
                          <option value="">{t('question.filters.selectPerformanceCycle')}</option>
                          {performanceCycles.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>
                              {cycle.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>{t('question.filters.assessmentMatrix')}</label>
                        <select
                          className="form-control"
                          value={selectedMatrixId}
                          onChange={(e) => {
                            setSelectedMatrixId(e.target.value);
                            setSelectedPillarId('');
                            setSelectedCategoryId('');
                          }}
                          disabled={!selectedCycleId}
                        >
                          <option value="">{t('question.filters.selectAssessmentMatrix')}</option>
                          {assessmentMatrices
                            .filter(m => !selectedCycleId || m.performanceCycleId === selectedCycleId)
                            .map(matrix => (
                              <option key={matrix.id} value={matrix.id}>
                                {matrix.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>{t('question.filters.pillar')}</label>
                        <select
                          className="form-control"
                          value={selectedPillarId}
                          onChange={(e) => {
                            setSelectedPillarId(e.target.value);
                            setSelectedCategoryId('');
                          }}
                          disabled={!selectedMatrixId}
                        >
                          <option value="">{t('question.filters.allPillars')}</option>
                          {pillars.map(pillar => (
                            <option key={pillar.id} value={pillar.id}>
                              {pillar.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>{t('question.filters.category')}</label>
                        <select
                          className="form-control"
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          disabled={!selectedPillarId}
                        >
                          <option value="">{t('question.filters.allCategories')}</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {selectedMatrixId && (
                    <div className="row mt-2">
                      <div className="col-12">
                        <div className="info-box bg-light">
                          <span className="info-box-icon bg-info">
                            <i className="fas fa-info"></i>
                          </span>
                          <div className="info-box-content">
                            <span className="info-box-text">{t('question.stats.totalQuestions')}</span>
                            <span className="info-box-number">{getFilteredQuestions().length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions List */}
              {selectedMatrixId && (
                <div className="questions-list">
                  {Object.keys(groupedQuestions).length === 0 ? (
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                        <p className="text-muted">{t('question.messages.noQuestions')}</p>
                      </div>
                    </div>
                  ) : (
                    Object.entries(groupedQuestions).map(([key, group]) => (
                      <div key={key} className="card mb-4">
                        <div className="card-header bg-gradient-light">
                          <h3 className="card-title">
                            <strong>{group.pillar}</strong> / {group.category}
                          </h3>
                          <div className="card-tools">
                            <span className="badge badge-primary">
                              {t('question.stats.questionCount', { count: group.questions.length })}
                            </span>
                          </div>
                        </div>
                        <div className="card-body p-0">
                          <div className="question-list">
                            {group.questions.map((question, index) => (
                              <div key={question.id} className={`${styles.questionItem} p-3 border-bottom`}>
                                <div className="row align-items-start">
                                  <div className="col-md-8">
                                    <div className="d-flex align-items-start">
                                      <span className={`${styles.questionNumber} mr-3 text-muted`}>
                                        Q{index + 1}.
                                      </span>
                                      <div className="flex-grow-1">
                                        <h5 className={`${styles.questionText} mb-2`}>
                                          {question.question}
                                        </h5>
                                        <div className={styles.questionMeta}>
                                          {getQuestionTypeBadge(question.questionType)}
                                          {question.points !== undefined && (
                                            <span className="badge badge-light ml-2">
                                              <i className="fas fa-star mr-1"></i>
                                              {t('question.details.points', { points: question.points })}
                                            </span>
                                          )}
                                          {question.optionGroup && (
                                            <span className="badge badge-info ml-2">
                                              <i className="fas fa-list mr-1"></i>
                                              {t('question.details.options', { count: Object.keys(question.optionGroup.optionMap).length })}
                                            </span>
                                          )}
                                        </div>
                                        {question.extraDescription && (
                                          <div className={`${styles.extraDescription} mt-2 text-muted small`}>
                                            <i className="fas fa-info-circle mr-1"></i>
                                            {question.extraDescription}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 text-right">
                                    <div className="btn-group">
                                      <button
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handlePreview(question)}
                                        title={t('question.buttons.preview')}
                                      >
                                        <i className="fas fa-eye"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEdit(question)}
                                        title={t('common.actions.edit')}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteClick(question)}
                                        title={t('common.actions.delete')}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {!selectedMatrixId && (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-arrow-up fa-3x text-muted mb-3"></i>
                    <p className="text-muted">
                      {t('question.messages.selectFilters')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Question Form Modal */}
        {showForm && (
          <QuestionForm
            question={selectedQuestion}
            isCustom={isCustomQuestion}
            assessmentMatrixId={selectedMatrixId}
            assessmentMatrix={selectedMatrix}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}

        {/* Preview Modal */}
        {showPreview && selectedQuestion && (
          <QuestionPreviewModal
            question={selectedQuestion}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title={t('question.dialogs.deleteTitle')}
          message={t('question.dialogs.deleteMessage', { question: selectedQuestion?.question })}
          confirmText={t('common.actions.delete')}
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

      </AdminLayout>
    </TenantProtected>
  );
}