'use client';

import React, { useState } from 'react';
import { Question, QuestionType } from '@/services/questionService';
import styles from './QuestionPreviewModal.module.css';

interface QuestionPreviewModalProps {
  question: Question;
  onClose: () => void;
}

export default function QuestionPreviewModal({ question, onClose }: QuestionPreviewModalProps) {
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [hoveredStars, setHoveredStars] = useState<number>(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Set<string>>(new Set());
  const [showPoints, setShowPoints] = useState(false);

  const renderQuestionInput = () => {
    switch (question.questionType) {
      case QuestionType.YES_NO:
        return (
          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label 
              className={`btn btn-outline-success ${selectedRadio === 'yes' ? 'active' : ''}`}
              onClick={() => setSelectedRadio('yes')}
            >
              <input type="radio" name="answer" checked={selectedRadio === 'yes'} readOnly /> Yes
            </label>
            <label 
              className={`btn btn-outline-danger ${selectedRadio === 'no' ? 'active' : ''}`}
              onClick={() => setSelectedRadio('no')}
            >
              <input type="radio" name="answer" checked={selectedRadio === 'no'} readOnly /> No
            </label>
          </div>
        );

      case QuestionType.STAR_THREE:
        return (
          <div className={styles.starRating}>
            {[1, 2, 3].map(star => (
              <i 
                key={star} 
                className={`fas fa-star ${(hoveredStars || selectedStars) >= star ? 'text-warning' : 'text-muted'}`}
                style={{ fontSize: '2rem', margin: '0 5px', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredStars(star)}
                onMouseLeave={() => setHoveredStars(0)}
                onClick={() => setSelectedStars(star)}
              ></i>
            ))}
          </div>
        );

      case QuestionType.STAR_FIVE:
        return (
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map(star => (
              <i 
                key={star} 
                className={`fas fa-star ${(hoveredStars || selectedStars) >= star ? 'text-warning' : 'text-muted'}`}
                style={{ fontSize: '2rem', margin: '0 5px', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredStars(star)}
                onMouseLeave={() => setHoveredStars(0)}
                onClick={() => setSelectedStars(star)}
              ></i>
            ))}
          </div>
        );

      case QuestionType.ONE_TO_TEN:
        return (
          <div className={styles.numberScale}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button 
                key={num} 
                className={`btn ${selectedNumber === num ? 'btn-primary' : 'btn-outline-primary'} mr-2 mb-2`}
                onClick={() => setSelectedNumber(num)}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case QuestionType.GOOD_BAD:
        return (
          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label 
              className={`btn btn-outline-success ${selectedRadio === 'good' ? 'active' : ''}`}
              onClick={() => setSelectedRadio('good')}
            >
              <input type="radio" name="answer" checked={selectedRadio === 'good'} readOnly /> Good
            </label>
            <label 
              className={`btn btn-outline-danger ${selectedRadio === 'bad' ? 'active' : ''}`}
              onClick={() => setSelectedRadio('bad')}
            >
              <input type="radio" name="answer" checked={selectedRadio === 'bad'} readOnly /> Bad
            </label>
          </div>
        );

      case QuestionType.OPEN_ANSWER:
        return (
          <textarea 
            className="form-control" 
            rows={4} 
            placeholder="Type your answer here..."
          />
        );

      case QuestionType.CUSTOMIZED:
        if (!question.optionGroup) return null;
        
        const options = Object.values(question.optionGroup.optionMap);
        // Backend uses 'multipleChoice' property name
        const isMultiple = question.optionGroup.isMultipleChoice ?? (question.optionGroup as {multipleChoice?: boolean}).multipleChoice ?? false;
        
        return (
          <div className={`custom-options ${question.optionGroup.showFlushed ? 'd-flex flex-wrap' : ''}`}>
            {options.map(option => {
              const optionId = `option-${option.id}`;
              const isChecked = isMultiple 
                ? selectedCheckboxes.has(optionId)
                : selectedRadio === optionId;
                
              return (
                <div 
                  key={option.id} 
                  className={`custom-control custom-${isMultiple ? 'checkbox' : 'radio'} ${question.optionGroup?.showFlushed ? 'mr-3' : 'mb-2'}`}
                >
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    className="custom-control-input"
                    id={optionId}
                    name="customAnswer"
                    checked={isChecked}
                    onChange={() => {
                      if (isMultiple) {
                        const newSet = new Set(selectedCheckboxes);
                        if (newSet.has(optionId)) {
                          newSet.delete(optionId);
                        } else {
                          newSet.add(optionId);
                        }
                        setSelectedCheckboxes(newSet);
                      } else {
                        setSelectedRadio(optionId);
                      }
                    }}
                  />
                  <label className="custom-control-label" htmlFor={optionId}>
                    {option.text}
                  </label>
                </div>
              );
            })}
          </div>
        );

      default:
        return <p className="text-muted">Unknown question type</p>;
    }
  };

  const renderPointsSection = () => {
    if (question.questionType !== QuestionType.CUSTOMIZED || !question.optionGroup) {
      return null;
    }

    const options = Object.values(question.optionGroup.optionMap);
    const hasPoints = options.some(opt => opt.points !== undefined && opt.points !== 0);

    if (!hasPoints) return null;

    return (
      <div className="points-section mt-3">
        <button
          className="btn btn-sm btn-outline-info"
          onClick={() => setShowPoints(!showPoints)}
          data-toggle="tooltip"
          data-placement="top"
          title="Shows point values for each option. This is only visible to administrators for verification purposes. Users will not see these point values."
        >
          <i className={`fas fa-${showPoints ? 'eye-slash' : 'eye'} mr-2`}></i>
          {showPoints ? 'Hide Points' : 'Show Points'}
        </button>
        
        {showPoints && (
          <div className={`${styles.pointsTable} mt-3`}>
            <table className="table table-sm table-bordered">
              <thead className="thead-light">
                <tr>
                  <th>Option</th>
                  <th width="100">Points</th>
                </tr>
              </thead>
              <tbody>
                {options.map(option => (
                  <tr key={option.id}>
                    <td>{option.text}</td>
                    <td className="text-center">{option.points || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const getQuestionTypeLabel = () => {
    const labels: Record<QuestionType, string> = {
      [QuestionType.YES_NO]: 'Yes/No Question',
      [QuestionType.STAR_THREE]: '3-Star Rating',
      [QuestionType.STAR_FIVE]: '5-Star Rating',
      [QuestionType.ONE_TO_TEN]: '1-10 Scale',
      [QuestionType.GOOD_BAD]: 'Good/Bad Choice',
      [QuestionType.OPEN_ANSWER]: 'Open Text Answer',
      [QuestionType.CUSTOMIZED]: 'Custom Options'
    };
    return labels[question.questionType];
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-info">
            <h5 className="modal-title">
              <i className="fas fa-eye mr-2"></i>
              Question Preview
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          
          <div className="modal-body">
            {/* Assessment Context */}
            <div className="assessment-context mb-4 p-3 bg-light rounded">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Pillar</small>
                  <p className="mb-0 font-weight-bold">{question.pillarName}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Category</small>
                  <p className="mb-0 font-weight-bold">{question.categoryName}</p>
                </div>
              </div>
            </div>

            {/* Question Preview Card */}
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">How this question will appear to users:</h6>
              </div>
              <div className="card-body">
                {/* Question */}
                <div className={styles.questionPreview}>
                  <h5 className="mb-3">{question.question}</h5>
                  
                  {/* Extra Description */}
                  {question.extraDescription && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle mr-2"></i>
                      {question.extraDescription}
                    </div>
                  )}
                  
                  {/* Answer Input */}
                  <div className="answer-section mt-4">
                    <label className="d-block mb-2 text-muted">
                      {getQuestionTypeLabel()}
                      {question.points !== undefined && (
                        <span className="ml-2">• {question.points} points</span>
                      )}
                    </label>
                    {renderQuestionInput()}
                  </div>
                  
                  {/* Points Section for Custom Questions */}
                  {renderPointsSection()}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className={`${styles.technicalDetails} mt-4`}>
              <h6 className="text-muted mb-3">Technical Details</h6>
              <div className="row">
                <div className="col-md-6">
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Type:</dt>
                    <dd className="col-sm-8">
                      <code>{question.questionType}</code>
                    </dd>
                    <dt className="col-sm-4">Points:</dt>
                    <dd className="col-sm-8">{question.points || 'N/A'}</dd>
                  </dl>
                </div>
                <div className="col-md-6">
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Question ID:</dt>
                    <dd className="col-sm-8">
                      <small className="text-monospace">{question.id}</small>
                    </dd>
                    {question.optionGroup && (
                      <>
                        <dt className="col-sm-4">Options:</dt>
                        <dd className="col-sm-8">
                          {Object.keys(question.optionGroup.optionMap).length} options
                          {(question.optionGroup.isMultipleChoice ?? (question.optionGroup as {multipleChoice?: boolean}).multipleChoice) && ' (multi-select)'}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}