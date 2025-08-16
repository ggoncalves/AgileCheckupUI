'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PerformanceCycle, PerformanceCycleCreateDto } from '@/services/performanceCycleService';
import { useTenant } from '@/infrastructure/auth';

interface PerformanceCycleFormProps {
  item?: PerformanceCycle;
  onSubmit: (data: PerformanceCycleCreateDto) => Promise<void>;
  onCancel: () => void;
  isModal?: boolean;
}

export const PerformanceCycleForm: React.FC<PerformanceCycleFormProps> = ({ item, onSubmit, onCancel, isModal = false }) => {
  const { t } = useTranslation();
  const { tenantId, companyId } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors
  } = useForm<PerformanceCycleCreateDto>({
    defaultValues: {
      tenantId: tenantId || '',
      companyId: companyId || '',
      name: '',
      description: '',
      isActive: true,
      isTimeSensitive: false,
      startDate: '',
      endDate: ''
    }
  });

  const watchEndDate = watch('endDate');
  const watchStartDate = watch('startDate');

  useEffect(() => {
    if (item) {
      reset({
        tenantId: item.tenantId,
        companyId: item.companyId,
        name: item.name,
        description: item.description || '',
        isActive: item.isActive,
        isTimeSensitive: item.isTimeSensitive,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''
      });
    }
  }, [item, reset]);

  // Update isTimeSensitive based on endDate
  useEffect(() => {
    setValue('isTimeSensitive', !!watchEndDate);
  }, [watchEndDate, setValue]);

  // Validate date range
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(watchEndDate);

      if (startDate >= endDate) {
        setError('endDate', {
          type: 'manual',
          message: t('performanceCycle.form.validation.endDateAfterStart')
        });
      } else {
        clearErrors('endDate');
      }
    }
  }, [watchStartDate, watchEndDate, setError, clearErrors, t]);

  const onFormSubmit = async (data: PerformanceCycleCreateDto) => {
    // Validate dates before submission
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        setError('endDate', {
          type: 'manual',
          message: t('performanceCycle.form.validation.endDateAfterStart')
        });
        return; // Prevent form submission
      }
    }

    setIsSubmitting(true);
    try {
      // Convert date strings to ISO format if they exist
      const formattedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        isTimeSensitive: !!data.endDate // Ensure isTimeSensitive matches business rule
      };
      await onSubmit(formattedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-sync-alt mr-2"></i>
          {item ? t('performanceCycle.form.editTitle') : t('performanceCycle.form.newTitle')}
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
                <label htmlFor="name">
                  {t('performanceCycle.form.fields.name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  placeholder={t('performanceCycle.form.placeholders.name')}
                  {...register('name', { required: t('performanceCycle.form.validation.nameRequired') })}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="isActive">{t('performanceCycle.form.fields.status')}</label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="isActive"
                    {...register('isActive')}
                  />
                  <label className="custom-control-label" htmlFor="isActive">
                    {t('performanceCycle.form.fields.active')}
                  </label>
                </div>
                <small className="form-text text-muted">
                  {t('performanceCycle.form.help.activeHelp')}
                </small>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('performanceCycle.form.fields.description')}</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder={t('performanceCycle.form.placeholders.description')}
              {...register('description')}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="startDate">{t('performanceCycle.form.fields.startDate')}</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  {...register('startDate')}
                />
                <small className="form-text text-muted">
                  {t('performanceCycle.form.help.startDateHelp')}
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="endDate">{t('performanceCycle.form.fields.endDate')}</label>
                <input
                  type="date"
                  className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                  id="endDate"
                  {...register('endDate')}
                />
                {errors.endDate ? (
                  <div className="invalid-feedback">{errors.endDate.message}</div>
                ) : (
                  <small className="form-text text-muted">
                    {t('performanceCycle.form.help.endDateHelp')}
                  </small>
                )}
              </div>
            </div>
          </div>

          {watchEndDate && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle mr-2"></i>
              {t('performanceCycle.form.help.timeSensitiveInfo')}
            </div>
          )}
        </div>

        <div className={`${isModal ? 'modal-footer border-top-0 bg-transparent px-0' : 'card-footer'}`}>
          <div className={`${isModal ? '' : 'd-flex justify-content-end'}`}>
            {!isModal && (
              <button
                type="button"
                className="btn btn-secondary mr-2"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('common.actions.cancel')}
              </button>
            )}
            <button
              type="submit"
              className={`btn btn-primary ${isModal ? 'mr-2' : ''}`}
              disabled={isSubmitting || !!errors.endDate}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  {item ? t('performanceCycle.form.buttons.updating') : t('performanceCycle.form.buttons.creating')}
                </>
              ) : (
                <>{item ? t('performanceCycle.form.buttons.update') : t('performanceCycle.form.buttons.create')} {t('performanceCycle.singular')}</>
              )}
            </button>
            {isModal && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('common.actions.cancel')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};