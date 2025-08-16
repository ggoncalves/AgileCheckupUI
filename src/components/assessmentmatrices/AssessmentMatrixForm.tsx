'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentMatrix, AssessmentMatrixCreateDto, Pillar, Category } from '@/services/assessmentMatrixService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { useTenant } from '@/infrastructure/auth';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

interface AssessmentMatrixFormProps {
  item?: AssessmentMatrix;
  onSubmit: (data: AssessmentMatrixCreateDto) => void;
  onCancel: () => void;
  selectedPerformanceCycleId?: string;
  isModal?: boolean;
}

const AssessmentMatrixForm: React.FC<AssessmentMatrixFormProps> = ({
  item,
  onSubmit,
  onCancel,
  selectedPerformanceCycleId,
  isModal = false
}) => {
  const { t } = useTranslation();
  const { tenantId } = useTenant();
  const [formData, setFormData] = useState<AssessmentMatrixCreateDto>({
    name: '',
    description: '',
    performanceCycleId: selectedPerformanceCycleId || '',
    pillarMap: {},
    tenantId: tenantId || ''
  });
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdDate, lastUpdatedDate, questionCount, potentialScore, ...createDto } = item;
      // Ensure all descriptions are at least empty strings when loading
      const sanitizedDto = {
        ...createDto,
        description: createDto.description || '',
        tenantId: tenantId || item.tenantId || '',
        pillarMap: Object.entries(createDto.pillarMap || {}).reduce((acc, [pillarId, pillar]) => ({
          ...acc,
          [pillarId]: {
            ...pillar,
            description: pillar.description || '',
            categoryMap: Object.entries(pillar.categoryMap || {}).reduce((catAcc, [catId, category]) => ({
              ...catAcc,
              [catId]: {
                ...category,
                description: category.description || ''
              }
            }), {})
          }
        }), {})
      };
      setFormData(sanitizedDto);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        performanceCycleId: selectedPerformanceCycleId || prev.performanceCycleId,
        tenantId: tenantId || ''
      }));
    }
  }, [item, selectedPerformanceCycleId, tenantId]);

  useEffect(() => {
    const fetchPerformanceCycles = async () => {
      try {
        const cycles = await performanceCycleService.getAll();
        // Filter only active cycles
        const activeCycles = cycles.filter(cycle => cycle.isActive);
        setPerformanceCycles(activeCycles);
      } catch (error) {
        console.error('Error fetching performance cycles:', error);
      }
    };

    fetchPerformanceCycles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate pillars and categories have names
    for (const pillar of Object.values(formData.pillarMap)) {
      if (!pillar.name || pillar.name.trim() === '') {
        alert(t('assessmentMatrix.form.validation.pillarNameRequired'));
        return;
      }
      
      for (const category of Object.values(pillar.categoryMap)) {
        if (!category.name || category.name.trim() === '') {
          alert(t('assessmentMatrix.form.validation.categoryNameRequired'));
          return;
        }
      }
    }
    
    setLoading(true);
    try {
      // Ensure all descriptions are at least empty strings
      const sanitizedData = {
        ...formData,
        description: formData.description || '',
        pillarMap: Object.entries(formData.pillarMap).reduce((acc, [pillarId, pillar]) => ({
          ...acc,
          [pillarId]: {
            ...pillar,
            description: pillar.description || '',
            categoryMap: Object.entries(pillar.categoryMap).reduce((catAcc, [catId, category]) => ({
              ...catAcc,
              [catId]: {
                ...category,
                description: category.description || ''
              }
            }), {})
          }
        }), {})
      };
      await onSubmit(sanitizedData);
    } finally {
      setLoading(false);
    }
  };

  const addPillar = () => {
    const pillarId = `pillar_${Date.now()}`;
    const categoryId = `category_${Date.now() + 1}`;
    const newPillar: Pillar = {
      id: pillarId,
      name: '',
      description: '',
      categoryMap: {
        [categoryId]: {
          id: categoryId,
          name: '',
          description: ''
        }
      }
    };
    setFormData(prev => ({
      ...prev,
      pillarMap: {
        ...prev.pillarMap,
        [pillarId]: newPillar
      }
    }));
  };

  const updatePillar = (pillarId: string, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      pillarMap: {
        ...prev.pillarMap,
        [pillarId]: {
          ...prev.pillarMap[pillarId],
          [field]: value
        }
      }
    }));
  };

  const deletePillar = (pillarId: string) => {
    const pillar = formData.pillarMap[pillarId];
    
    setConfirmDialog({
      isOpen: true,
      title: t('assessmentMatrix.form.dialogs.deletePillar.title'),
      message: t('assessmentMatrix.form.dialogs.deletePillar.message', { pillarName: pillar.name }),
      onConfirm: () => {
        setFormData(prev => {
          const newPillarMap = { ...prev.pillarMap };
          delete newPillarMap[pillarId];
          return { ...prev, pillarMap: newPillarMap };
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const addCategory = (pillarId: string) => {
    const categoryId = `category_${Date.now()}`;
    const newCategory: Category = {
      id: categoryId,
      name: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      pillarMap: {
        ...prev.pillarMap,
        [pillarId]: {
          ...prev.pillarMap[pillarId],
          categoryMap: {
            ...prev.pillarMap[pillarId].categoryMap,
            [categoryId]: newCategory
          }
        }
      }
    }));
  };

  const updateCategory = (pillarId: string, categoryId: string, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      pillarMap: {
        ...prev.pillarMap,
        [pillarId]: {
          ...prev.pillarMap[pillarId],
          categoryMap: {
            ...prev.pillarMap[pillarId].categoryMap,
            [categoryId]: {
              ...prev.pillarMap[pillarId].categoryMap[categoryId],
              [field]: value
            }
          }
        }
      }
    }));
  };

  const deleteCategory = (pillarId: string, categoryId: string) => {
    const pillar = formData.pillarMap[pillarId];
    const category = pillar.categoryMap[categoryId];
    const categoryCount = Object.keys(pillar.categoryMap).length;
    
    // Don't allow deleting the last category
    if (categoryCount <= 1) {
      alert(t('assessmentMatrix.form.validation.pillarNeedsCategory'));
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: t('assessmentMatrix.form.dialogs.deleteCategory.title'),
      message: t('assessmentMatrix.form.dialogs.deleteCategory.message', { categoryName: category.name }),
      onConfirm: () => {
        setFormData(prev => {
          const newCategoryMap = { ...prev.pillarMap[pillarId].categoryMap };
          delete newCategoryMap[categoryId];
          return {
            ...prev,
            pillarMap: {
              ...prev.pillarMap,
              [pillarId]: {
                ...prev.pillarMap[pillarId],
                categoryMap: newCategoryMap
              }
            }
          };
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={isModal ? '' : 'card'}>
        {!isModal && (
          <div className="card-header">
            <h3 className="card-title">
              {item ? t('assessmentMatrix.form.editTitle') : t('assessmentMatrix.form.createTitle')}
            </h3>
          </div>
        )}
        <div className={isModal ? '' : 'card-body'}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="name">{t('assessmentMatrix.form.fields.name')} *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="performanceCycleId">{t('assessmentMatrix.form.fields.performanceCycle')} *</label>
                <select
                  className="form-control"
                  id="performanceCycleId"
                  value={formData.performanceCycleId}
                  onChange={(e) => setFormData({ ...formData, performanceCycleId: e.target.value })}
                  required
                >
                  <option value="">{t('assessmentMatrix.form.placeholders.selectPerformanceCycle')}</option>
                  {performanceCycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
                {selectedPerformanceCycleId && (
                  <small className="text-muted">{t('assessmentMatrix.form.help.preselectedFromFilter')}</small>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">{t('assessmentMatrix.form.fields.description')}</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label>{t('assessmentMatrix.form.sections.pillarsAndCategories')}</label>
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={addPillar}
              >
                <i className="fas fa-plus"></i> {t('assessmentMatrix.form.buttons.addPillar')}
              </button>
            </div>
            
            {Object.entries(formData.pillarMap).map(([pillarId, pillar]) => (
              <div key={pillarId} className="card mb-3">
                <div className="card-header">
                  <div className="row">
                    <div className="col-md-5">
                      <input
                        type="text"
                        className={`form-control ${!pillar.name ? 'is-invalid' : ''}`}
                        placeholder={t('assessmentMatrix.form.placeholders.pillarName')}
                        value={pillar.name}
                        onChange={(e) => updatePillar(pillarId, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('assessmentMatrix.form.placeholders.pillarDescription')}
                        value={pillar.description || ''}
                        onChange={(e) => updatePillar(pillarId, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => deletePillar(pillarId)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">{t('assessmentMatrix.form.sections.categories')}</small>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => addCategory(pillarId)}
                    >
                      <i className="fas fa-plus"></i> {t('assessmentMatrix.form.buttons.addCategory')}
                    </button>
                  </div>
                  
                  {Object.entries(pillar.categoryMap).map(([categoryId, category]) => (
                    <div key={categoryId} className="row mb-2">
                      <div className="col-md-5">
                        <input
                          type="text"
                          className={`form-control form-control-sm ${!category.name ? 'is-invalid' : ''}`}
                          placeholder={t('assessmentMatrix.form.placeholders.categoryName')}
                          value={category.name}
                          onChange={(e) => updateCategory(pillarId, categoryId, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder={t('assessmentMatrix.form.placeholders.categoryDescription')}
                          value={category.description || ''}
                          onChange={(e) => updateCategory(pillarId, categoryId, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteCategory(pillarId, categoryId)}
                          disabled={Object.keys(pillar.categoryMap).length <= 1}
                          title={Object.keys(pillar.categoryMap).length <= 1 ? t('assessmentMatrix.form.validation.pillarNeedsCategory') : t('assessmentMatrix.form.buttons.deleteCategory')}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`${isModal ? 'modal-footer border-top-0 bg-transparent px-0' : 'card-footer'}`}>
          {!isModal && (
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={onCancel}
            >
              {t('common.actions.cancel')}
            </button>
          )}
          <button
            type="submit"
            className={`btn btn-primary ${isModal ? 'mr-2' : ''}`}
            disabled={loading}
          >
            {loading ? t('assessmentMatrix.form.buttons.saving') : t('assessmentMatrix.form.buttons.save')}
          </button>
          {isModal && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {t('common.actions.cancel')}
            </button>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        confirmText={t('common.actions.delete')}
        type="danger"
      />
    </form>
  );
};

export default AssessmentMatrixForm;