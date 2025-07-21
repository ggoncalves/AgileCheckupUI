'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentMatrix } from '@/services/assessmentMatrixService';

interface AssessmentMatrixStructureModalProps {
  matrix: AssessmentMatrix;
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentMatrixStructureModal: React.FC<AssessmentMatrixStructureModalProps> = ({
  matrix,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              <i className="fas fa-sitemap mr-2"></i>
              {matrix.name} - {t('assessmentMatrix.structure.title')}
            </h4>
            <button
              type="button"
              className="close"
              onClick={onClose}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {!matrix.pillarMap || Object.keys(matrix.pillarMap).length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="fas fa-info-circle fa-3x mb-3"></i>
                <p>{t('assessmentMatrix.structure.noPillarsMessage')}</p>
              </div>
            ) : (
              <div>
                <div className="row mb-3">
                  <div className="col-sm-6">
                    <div className="info-box">
                      <span className="info-box-icon bg-info">
                        <i className="fas fa-columns"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text">{t('assessmentMatrix.structure.pillars')}</span>
                        <span className="info-box-number">
                          {Object.keys(matrix.pillarMap).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="info-box">
                      <span className="info-box-icon bg-success">
                        <i className="fas fa-th-list"></i>
                      </span>
                      <div className="info-box-content">
                        <span className="info-box-text">{t('assessmentMatrix.structure.categories')}</span>
                        <span className="info-box-number">
                          {Object.values(matrix.pillarMap).reduce((total, pillar) => {
                            return total + (pillar.categoryMap ? Object.keys(pillar.categoryMap).length : 0);
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {Object.entries(matrix.pillarMap).map(([pillarId, pillar]) => (
                    <div key={pillarId} className="col-md-6 mb-3">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">
                            <i className="fas fa-columns text-info mr-2"></i>
                            {pillar.name}
                          </h5>
                        </div>
                        <div className="card-body">
                          {pillar.description && (
                            <p className="text-muted small mb-2">{pillar.description}</p>
                          )}
                          
                          <h6 className="mb-2">
                            <i className="fas fa-th-list mr-1"></i>
                            {t('assessmentMatrix.structure.categoriesCount', { count: pillar.categoryMap ? Object.keys(pillar.categoryMap).length : 0 })}
                          </h6>
                          
                          {!pillar.categoryMap || Object.keys(pillar.categoryMap).length === 0 ? (
                            <div className="text-muted small">{t('assessmentMatrix.structure.noCategoriesMessage')}</div>
                          ) : (
                            <ul className="list-unstyled mb-0">
                              {Object.entries(pillar.categoryMap).map(([categoryId, category]) => (
                                <li key={categoryId} className="mb-1">
                                  <span className="badge badge-outline-secondary mr-2">
                                    <i className="fas fa-tag mr-1"></i>
                                    {category.name}
                                  </span>
                                  {category.description && (
                                    <small className="text-muted">- {category.description}</small>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {t('common.actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentMatrixStructureModal;