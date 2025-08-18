'use client';

import React from 'react';
import { useSSRTranslation } from '@/hooks/useSSRTranslation';
import { Question, QuestionType, QuestionOption } from '../../services/questionService';
import styles from './QuestionRenderer.module.css';

interface QuestionRendererProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange }) => {
  const { t } = useSSRTranslation();
  const renderStarRating = (maxStars: number) => {
    const currentRating = parseInt(value) || 0;

    return (
      <div className={`${styles.starRating} star-rating`}>
        <div className="d-flex align-items-center">
          {[...Array(maxStars)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={starValue}
                type="button"
                className={`btn btn-link p-1 ${starValue <= currentRating ? 'text-warning' : 'text-muted'}`}
                onClick={() => onChange(starValue.toString())}
                style={{ fontSize: '2rem', lineHeight: 1 }}
              >
                <i className={`fas fa-star`}></i>
              </button>
            );
          })}
          <span className="ml-3 h5 mb-0">
            {currentRating > 0 ? `${currentRating} / ${maxStars}` : t('assessment.taking.question.selectRating')}
          </span>
        </div>
        <small className="form-text text-muted">
          {t('assessment.taking.question.starRatingHint', { maxStars })}
        </small>
      </div>
    );
  };

  const renderNumericScale = () => {
    const currentValue = parseInt(value) || 0;

    return (
      <div className={`${styles.numericScale} numeric-scale`}>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[...Array(10)].map((_, index) => {
            const numValue = index + 1;
            return (
              <button
                key={numValue}
                type="button"
                className={`btn ${numValue === currentValue ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onChange(numValue.toString())}
                style={{ minWidth: '45px' }}
              >
                {numValue}
              </button>
            );
          })}
        </div>
        <div className="d-flex justify-content-between">
          <small className="text-muted">1 - Poor</small>
          <small className="text-muted">10 - Excellent</small>
        </div>
        {currentValue > 0 && (
          <div className="text-center mt-2">
            <span className="badge badge-primary">Selected: {currentValue}</span>
          </div>
        )}
      </div>
    );
  };

  const renderYesNo = () => {
    return (
      <div className={`${styles.buttonGroup} yes-no-buttons`}>
        <div className="btn-group btn-group-lg w-100" role="group">
          <button
            type="button"
            className={`btn ${value === 'Yes' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => onChange('Yes')}
          >
            <i className="fas fa-check mr-2"></i>
            Yes
          </button>
          <button
            type="button"
            className={`btn ${value === 'No' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => onChange('No')}
          >
            <i className="fas fa-times mr-2"></i>
            No
          </button>
        </div>
      </div>
    );
  };

  const renderGoodBad = () => {
    return (
      <div className={`${styles.buttonGroup} good-bad-buttons`}>
        <div className="btn-group btn-group-lg w-100" role="group">
          <button
            type="button"
            className={`btn ${value === 'Good' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => onChange('Good')}
          >
            <i className="fas fa-thumbs-up mr-2"></i>
            Good
          </button>
          <button
            type="button"
            className={`btn ${value === 'Bad' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => onChange('Bad')}
          >
            <i className="fas fa-thumbs-down mr-2"></i>
            Bad
          </button>
        </div>
      </div>
    );
  };

  const renderOpenAnswer = () => {
    return (
      <div className={`${styles.openAnswer} open-answer`}>
        <textarea
          className="form-control"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Please provide your detailed response..."
        />
        <small className="form-text text-muted">
          Take your time to provide a thoughtful response.
        </small>
      </div>
    );
  };

  const renderCustomOptions = () => {
    if (!question.optionGroup?.optionMap) {
      return <div className="alert alert-warning">No options available for this question.</div>;
    }

    const options = Object.values(question.optionGroup.optionMap);
    const isMultipleChoice = question.optionGroup.isMultipleChoice;

    if (isMultipleChoice) {
      // Multiple choice - checkboxes
      const selectedValues = value ? value.split(',') : [];

      return (
        <div className={`${styles.customOptions} custom-options`}>
          {options.map((option: QuestionOption) => (
            <div key={option.id} className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id={`option-${option.id}`}
                checked={selectedValues.includes(option.id.toString())}
                onChange={(e) => {
                  let newSelected;
                  if (e.target.checked) {
                    newSelected = [...selectedValues, option.id.toString()];
                  } else {
                    newSelected = selectedValues.filter(id => id !== option.id.toString());
                  }
                  onChange(newSelected.join(','));
                }}
              />
              <label className="form-check-label" htmlFor={`option-${option.id}`}>
                {option.text}
              </label>
            </div>
          ))}
          <small className="form-text text-muted">
            You can select multiple options.
          </small>
        </div>
      );
    } else {
      // Single choice - radio buttons
      return (
        <div className={`${styles.customOptions} custom-options`}>
          {options.map((option: QuestionOption) => (
            <div key={option.id} className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name={`question-${question.id}`}
                id={`option-${option.id}`}
                checked={value === option.id.toString()}
                onChange={() => onChange(option.id.toString())}
              />
              <label className="form-check-label" htmlFor={`option-${option.id}`}>
                {option.text}
              </label>
            </div>
          ))}
          <small className="form-text text-muted">
            Please select one option.
          </small>
        </div>
      );
    }
  };

  // Render based on question type
  switch (question.questionType) {
    case QuestionType.STAR_THREE:
      return renderStarRating(3);
    
    case QuestionType.STAR_FIVE:
      return renderStarRating(5);
    
    case QuestionType.ONE_TO_TEN:
      return renderNumericScale();
    
    case QuestionType.YES_NO:
      return renderYesNo();
    
    case QuestionType.GOOD_BAD:
      return renderGoodBad();
    
    case QuestionType.OPEN_ANSWER:
      return renderOpenAnswer();
    
    case QuestionType.CUSTOMIZED:
      return renderCustomOptions();
    
    default:
      return (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Unsupported question type: {question.questionType}
        </div>
      );
  }
};

export default QuestionRenderer;