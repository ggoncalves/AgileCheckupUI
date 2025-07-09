'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Team, TeamCreateDto } from '../../services/teamService';
import { Department } from '../../services/departmentService';
import { departmentApi } from '../../services/departmentService';
import { useTenant } from '@/infrastructure/auth';

interface TeamFormProps {
  item?: Team;
  onSubmit: (data: TeamCreateDto) => Promise<void>;
  onCancel: () => void;
}

export const TeamForm: React.FC<TeamFormProps> = ({ item, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const { tenantId, companyId } = useTenant();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TeamCreateDto>({
    defaultValues: {
      tenantId: tenantId || '',
      companyId: companyId || '',
      departmentId: '',
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!tenantId) return;
      
      try {
        setLoadingDepartments(true);
        const deps = await departmentApi.getAll();
        setDepartments(deps);
      } catch (error) {
        console.error('Error loading departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [tenantId]);

  useEffect(() => {
    if (item && departments.length > 0) {
      reset({
        tenantId: item.tenantId,
        companyId: item.department?.companyId || companyId || '',
        departmentId: item.department?.id || '',
        name: item.name,
        description: item.description || ''
      });
    }
  }, [item, departments, reset, companyId]);

  const onFormSubmit = async (data: TeamCreateDto) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-users mr-2"></i>
          {item ? t('team.form.editTitle') : t('team.form.newTitle')}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="card-body">
          {/* Hidden fields for tenant context */}
          <input type="hidden" {...register('tenantId')} />
          <input type="hidden" {...register('companyId')} />
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="departmentId">
                  {t('team.form.fields.department')} <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${errors.departmentId ? 'is-invalid' : ''}`}
                  id="departmentId"
                  {...register('departmentId', { required: t('team.form.validation.departmentRequired') })}
                  disabled={loadingDepartments}
                >
                  <option value="">{t('team.form.placeholders.selectDepartment')}</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <div className="invalid-feedback">{errors.departmentId.message}</div>
                )}
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="name">
                  {t('team.form.fields.name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  placeholder={t('team.form.placeholders.teamName')}
                  {...register('name', { required: t('team.form.validation.nameRequired') })}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('team.form.fields.description')}</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder={t('team.form.placeholders.description')}
              {...register('description')}
            />
          </div>
        </div>

        <div className="form-group d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary mr-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.actions.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || loadingDepartments}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                {item ? t('team.form.buttons.updating') : t('team.form.buttons.creating')}
              </>
            ) : (
              <>{item ? t('team.form.buttons.update') : t('team.form.buttons.create')} {t('team.singular')}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};