'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/infrastructure/auth';
import questionService, { Question, QuestionFormData, QuestionType, QuestionOption } from '@/services/questionService';
import { AssessmentMatrix } from '@/services/assessmentMatrixService';

interface QuestionFormProps {
  question: Question | null;
  isCustom: boolean;
  assessmentMatrixId: string;
  assessmentMatrix?: AssessmentMatrix;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  onError?: (message: string) => void;
}

export default function QuestionForm({
  question,
  isCustom,
  assessmentMatrixId,
  assessmentMatrix,
  onClose,
  onSuccess,
  onError
}: QuestionFormProps) {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loadingButton, setLoadingButton] = useState<'save' | 'saveAndClose' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form fields
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.YES_NO);
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [extraDescription, setExtraDescription] = useState('');
  const [selectedPillarId, setSelectedPillarId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  // Custom question fields
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [showFlushed, setShowFlushed] = useState(false);
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 1, text: '', points: 0 },
    { id: 2, text: '', points: 0 }
  ]);

  // Derived data
  const pillars = assessmentMatrix ? Object.values(assessmentMatrix.pillarMap || {}) : [];
  const selectedPillar = pillars.find(p => p.id === selectedPillarId);
  const categories = selectedPillar ? Object.values(selectedPillar.categoryMap || {}) : [];

  useEffect(() => {
    if (question) {
      setQuestionText(question.question);
      setQuestionType(question.questionType);
      setPoints(question.points);
      setExtraDescription(question.extraDescription || '');
      setSelectedPillarId(question.pillarId);
      setSelectedCategoryId(question.categoryId);
      
      if (question.optionGroup) {
        // Backend returns 'multipleChoice' but frontend expects 'isMultipleChoice'
        const isMultiple = question.optionGroup.isMultipleChoice ?? (question.optionGroup as {multipleChoice?: boolean}).multipleChoice ?? false;
        setIsMultipleChoice(isMultiple);
        setShowFlushed(question.optionGroup.showFlushed);
        const optionsList = Object.values(question.optionGroup.optionMap)
          .sort((a, b) => a.id - b.id)
          .map(opt => ({
            id: opt.id,
            text: opt.text,
            points: opt.points ?? 0 // Ensure points is always a number
          }));
        setOptions(optionsList);
      }
    } else {
      // Reset form for new question
      setQuestionText('');
      setQuestionType(isCustom ? QuestionType.CUSTOMIZED : QuestionType.YES_NO);
      setPoints(undefined);
      setExtraDescription('');
      setIsMultipleChoice(false);
      setShowFlushed(false);
      setOptions([
        { id: 1, text: '', points: 0 },
        { id: 2, text: '', points: 0 }
      ]);
    }
  }, [question, isCustom]);

  const handleSubmit = async (e: React.FormEvent, closeAfterSave: boolean = false) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Set which button is loading
    setLoadingButton(closeAfterSave ? 'saveAndClose' : 'save');
    
    const formData: QuestionFormData = {
      question: questionText,
      questionType,
      tenantId: tenantId!,
      assessmentMatrixId,
      pillarId: selectedPillarId,
      categoryId: selectedCategoryId,
      extraDescription: extraDescription || undefined
    };
    
    // Only add points for non-custom questions
    if (!(isCustom || questionType === QuestionType.CUSTOMIZED)) {
      formData.points = points;
    }
    
    // Validate required fields
    if (!formData.tenantId || !formData.assessmentMatrixId || !formData.pillarId || !formData.categoryId) {
      console.error('Missing required fields:', {
        tenantId: formData.tenantId,
        assessmentMatrixId: formData.assessmentMatrixId,
        pillarId: formData.pillarId,
        categoryId: formData.categoryId
      });
      setErrors({ submit: 'Missing required fields' });
      setLoadingButton(null);
      return;
    }
    
    if (isCustom || questionType === QuestionType.CUSTOMIZED) {
      formData.isMultipleChoice = isMultipleChoice ?? false;
      formData.showFlushed = showFlushed ?? false;
      // Ensure all options have points field as number and validate structure
      formData.options = options
        .filter(opt => opt.text.trim() !== '') // Remove empty options
        .map((opt, index) => ({
          id: index + 1, // Ensure sequential IDs starting from 1
          text: opt.text.trim(),
          points: Number(opt.points ?? 0) // Ensure it's a number
        }));
      
    }
    
    try {
      setLoading(true);
      
      if (question?.id) {
        // Update
        if (isCustom || questionType === QuestionType.CUSTOMIZED) {
          await questionService.updateCustom(question.id, formData);
        } else {
          await questionService.update(question.id, formData);
        }
      } else {
        // Create
        if (isCustom || questionType === QuestionType.CUSTOMIZED) {
          await questionService.createCustom(formData);
        } else {
          await questionService.create(formData);
        }
      }
      
      // Show success toast for all operations
      const actionMessage = question 
        ? `Question "${questionText}" updated successfully!`
        : `Question "${questionText}" created successfully!`;
      
      if (closeAfterSave) {
        // Pass message to parent for toast display
        onSuccess(actionMessage);
      } else {
        // Show toast locally for "Create" button since form stays open
        setToastMessage(actionMessage);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        // Clear form but keep pillar and category for "Create" button (continue creating)
        setQuestionText('');
        setQuestionType(isCustom ? QuestionType.CUSTOMIZED : QuestionType.YES_NO);
        setPoints(undefined);
        setExtraDescription('');
        setIsMultipleChoice(false);
        setShowFlushed(false);
        setOptions([
          { id: 1, text: '', points: 0 },
          { id: 2, text: '', points: 0 }
        ]);
        // Keep selectedPillarId and selectedCategoryId for continue editing
      }
    } catch (error: unknown) {
      console.error('Error saving question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save question';
      setErrors({ submit: errorMessage });
      
      // Show error toast
      if (onError) {
        onError(errorMessage);
      } else {
        // Show local error toast if no error handler provided
        setToastMessage(errorMessage);
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    } finally {
      setLoading(false);
      setLoadingButton(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!questionText.trim()) {
      newErrors.question = 'Question text is required';
    }
    
    if (!selectedPillarId) {
      newErrors.pillar = 'Pillar is required';
    }
    
    if (!selectedCategoryId) {
      newErrors.category = 'Category is required';
    }
    
    if (isCustom || questionType === QuestionType.CUSTOMIZED) {
      const validOptions = options.filter(opt => opt.text.trim() !== '');
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options with text are required';
      } else if (options.length > 64) {
        newErrors.options = 'Maximum 64 options allowed';
      }
      
      // Validate individual options
      options.forEach((option, index) => {
        if (!option.text.trim()) {
          newErrors[`option_text_${index}`] = 'Option text is required';
        }
        if (option.points === undefined || option.points === null || isNaN(option.points)) {
          newErrors[`option_points_${index}`] = 'Points value is required';
        } else if (option.points < 0) {
          newErrors[`option_points_${index}`] = 'Points must be 0 or greater';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOption = () => {
    if (options.length < 64) {
      const newId = options.length + 1;
      setOptions([...options, { id: newId, text: '', points: 0 }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Renumber IDs
      const renumbered = newOptions.map((opt, i) => ({
        ...opt,
        id: i + 1
      }));
      setOptions(renumbered);
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'points', value: string | number) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index].text = value as string;
    } else {
      newOptions[index].points = value as number;
    }
    setOptions(newOptions);
    
    // Clear validation errors for this field
    const newErrors = { ...errors };
    delete newErrors[`option_${field}_${index}`];
    setErrors(newErrors);
  };

  const standardTypes = [
    QuestionType.YES_NO,
    QuestionType.STAR_THREE,
    QuestionType.STAR_FIVE,
    QuestionType.ONE_TO_TEN,
    QuestionType.GOOD_BAD,
    QuestionType.OPEN_ANSWER
  ];

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="toast show position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
          <div className={`toast-header bg-${toastType} text-white`}>
            <i className={`fas fa-${toastType === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2`}></i>
            <strong className="mr-auto">{toastType === 'success' ? 'Success' : 'Error'}</strong>
            <button type="button" className="ml-2 mb-1 close text-white" onClick={() => setShowToast(false)}>
              <span>&times;</span>
            </button>
          </div>
          <div className="toast-body">
            {toastMessage}
          </div>
        </div>
      )}

      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`fas fa-${question ? 'edit' : 'plus'} mr-2`}></i>
              {question ? 'Edit' : 'Create'} {isCustom ? 'Custom' : 'Standard'} Question
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            // Default to save and close when form is submitted naturally (Enter key)
            handleSubmit(e, true);
          }}>
            <div className="modal-body">
              {errors.submit && (
                <div className="alert alert-danger">{errors.submit}</div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Pillar <span className="text-danger">*</span></label>
                    <select
                      className={`form-control ${errors.pillar ? 'is-invalid' : ''}`}
                      value={selectedPillarId}
                      onChange={(e) => {
                        setSelectedPillarId(e.target.value);
                        setSelectedCategoryId('');
                      }}
                      required
                    >
                      <option value="">Select Pillar</option>
                      {pillars.map(pillar => (
                        <option key={pillar.id} value={pillar.id}>
                          {pillar.name}
                        </option>
                      ))}
                    </select>
                    {errors.pillar && (
                      <div className="invalid-feedback">{errors.pillar}</div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Category <span className="text-danger">*</span></label>
                    <select
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      disabled={!selectedPillarId}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Question Text <span className="text-danger">*</span></label>
                <textarea
                  className={`form-control ${errors.question ? 'is-invalid' : ''}`}
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here..."
                  required
                />
                {errors.question && (
                  <div className="invalid-feedback">{errors.question}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Extra Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={extraDescription}
                  onChange={(e) => setExtraDescription(e.target.value)}
                  placeholder="Add clarification or context for this question (optional)..."
                />
                <small className="form-text text-muted">
                  Use this field to provide additional context or clarification for the question
                </small>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Question Type <span className="text-danger">*</span></label>
                    <select
                      className="form-control"
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                      disabled={isCustom}
                    >
                      {isCustom ? (
                        <option value={QuestionType.CUSTOMIZED}>Custom Question</option>
                      ) : (
                        standardTypes.map(type => (
                          <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                
                {!(isCustom || questionType === QuestionType.CUSTOMIZED) && (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Points</label>
                      <input
                        type="number"
                        className="form-control"
                        value={points || ''}
                        onChange={(e) => setPoints(e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        step="0.1"
                        placeholder="Points for this question"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Custom Question Options */}
              {(isCustom || questionType === QuestionType.CUSTOMIZED) && (
                <div className="custom-question-section border-top pt-3 mt-3">
                  <h6 className="mb-3">Custom Question Options</h6>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="multipleChoice"
                          checked={isMultipleChoice || false}
                          onChange={(e) => setIsMultipleChoice(e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="multipleChoice">
                          Allow Multiple Selection
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="showFlushed"
                          checked={showFlushed}
                          onChange={(e) => setShowFlushed(e.target.checked)}
                        />
                        <label className="custom-control-label" htmlFor="showFlushed">
                          Show Flushed Layout
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Options ({options.length} of 64) <span className="text-danger">*</span>
                      {errors.options && (
                        <span className="text-danger ml-2">- {errors.options}</span>
                      )}
                    </label>
                    <small className="form-text text-muted mb-2">
                      <i className="fas fa-info-circle mr-1"></i>
                      Each option must have text and points value. Points determine scoring for this option.
                    </small>
                    
                    <div className="options-list">
                      {/* Header row */}
                      <div className="mb-2">
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text bg-light">
                              <strong>#</strong>
                            </span>
                          </div>
                          <div className="form-control bg-light border-0 d-flex align-items-center">
                            <strong>Option Text</strong>
                          </div>
                          <div className="form-control bg-light border-0 d-flex align-items-center justify-content-center" style={{ maxWidth: '100px' }}>
                            <strong>Points</strong>
                          </div>
                          <div className="input-group-append">
                            <span className="input-group-text bg-light">
                              <strong>Action</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {options.map((option, index) => (
                        <div key={index} className="option-item mb-2">
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                {index + 1}
                              </span>
                            </div>
                            <input
                              type="text"
                              className={`form-control ${errors[`option_text_${index}`] ? 'is-invalid' : ''}`}
                              value={option.text}
                              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                              placeholder="Option text"
                              required
                            />
                            <input
                              type="number"
                              className={`form-control ${errors[`option_points_${index}`] ? 'is-invalid' : ''}`}
                              style={{ maxWidth: '100px' }}
                              value={option.points ?? ''}
                              onChange={(e) => handleOptionChange(index, 'points', parseFloat(e.target.value) || 0)}
                              placeholder="Points*"
                              step="0.1"
                              min="0"
                              required
                            />
                            <div className="input-group-append">
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleRemoveOption(index)}
                                disabled={options.length <= 2}
                                title="Remove option"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          {/* Option validation errors */}
                          {(errors[`option_text_${index}`] || errors[`option_points_${index}`]) && (
                            <div className="mt-1">
                              {errors[`option_text_${index}`] && (
                                <div className="text-danger small">
                                  <i className="fas fa-exclamation-triangle mr-1"></i>
                                  {errors[`option_text_${index}`]}
                                </div>
                              )}
                              {errors[`option_points_${index}`] && (
                                <div className="text-danger small">
                                  <i className="fas fa-exclamation-triangle mr-1"></i>
                                  {errors[`option_points_${index}`]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {options.length < 64 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={handleAddOption}
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              
              {/* Save and Close Button - always available */}
              <button 
                type="button" 
                className="btn btn-success" 
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e, true);
                }}
              >
                {loadingButton === 'saveAndClose' ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    {question ? 'Update' : 'Create and Close'}
                  </>
                )}
              </button>
              
              {/* Save Button - only for create */}
              {!question && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e, false);
                  }}
                >
                  {loadingButton === 'save' ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Create
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}