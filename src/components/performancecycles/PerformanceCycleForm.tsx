'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PerformanceCycle, PerformanceCycleCreateDto } from '@/services/performanceCycleService';
import { useTenant } from '@/infrastructure/auth';

interface PerformanceCycleFormProps {
  item?: PerformanceCycle;
  onSubmit: (data: PerformanceCycleCreateDto) => Promise<void>;
  onCancel: () => void;
}

export const PerformanceCycleForm: React.FC<PerformanceCycleFormProps> = ({ item, onSubmit, onCancel }) => {
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
          message: 'End date must be after start date'
        });
      } else {
        clearErrors('endDate');
      }
    }
  }, [watchStartDate, watchEndDate, setError, clearErrors]);

  const onFormSubmit = async (data: PerformanceCycleCreateDto) => {
    // Validate dates before submission
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        setError('endDate', {
          type: 'manual',
          message: 'End date must be after start date'
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
          {item ? 'Edit Performance Cycle' : 'New Performance Cycle'}
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
                  Cycle Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  placeholder="e.g., Q1 2024, Annual Review"
                  {...register('name', { required: 'Cycle name is required' })}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="isActive"
                    {...register('isActive')}
                  />
                  <label className="custom-control-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
                <small className="form-text text-muted">
                  Active cycles can be used for assessments
                </small>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder="Enter cycle description (optional)"
              {...register('description')}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  {...register('startDate')}
                />
                <small className="form-text text-muted">
                  When this performance cycle begins
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
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
                    Leave empty for ongoing cycles
                  </small>
                )}
              </div>
            </div>
          </div>

          {watchEndDate && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle mr-2"></i>
              This cycle is time-sensitive because an end date is specified.
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !!errors.endDate}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  {item ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{item ? 'Update' : 'Create'} Cycle</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};