'use client'

import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Department} from '@/services/departmentService';
import {Company, companyApi} from '@/services/companyService';
import {useTenant} from '@/contexts/TenantContext';

// Type for form data derived from Department interface
type DepartmentFormData = Omit<Department, 'id' | 'createdDate' | 'lastUpdatedDate'>;

interface DepartmentFormProps {
  item?: Department;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
                                                         item,
                                                         onSubmit,
                                                         onCancel
                                                       }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const { tenantId, companyName, companyId } = useTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<DepartmentFormData>({
    defaultValues: item ? {
      name: item.name,
      description: item.description || '',
      tenantId: tenantId || item.tenantId || '', // Prefer tenantId
      companyId: companyId || item.companyId || ''
    } : {
      name: '',
      description: '',
      tenantId: tenantId || '', // Use tenantId
      companyId: companyId || ''
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  // Update tenantId when tenantId changes
  useEffect(() => {
    if (tenantId) {
      setValue('tenantId', tenantId);
    }
    if (companyId) {
      setValue('companyId', companyId)
    }
  }, [tenantId, companyId, setValue]);

  // Fetch companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const data = await companyApi.getAll();
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again.');
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const onFormSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      data.tenantId = tenantId || data.tenantId;
      data.companyId = companyId || data.companyId;
      await onSubmit(data);
      reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An error occurred. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Department Name */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="name">Name <span className="text-danger">*</span></label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              {...register('name', {
                required: 'Department name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' }
              })}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>
        </div>

        {/* Hidden input for tenantId */}
        <input
          type="hidden"
          {...register('tenantId')}
        />

        {/* Optional: Display the tenant ID as read-only text */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="tenantIdDisplay">Tenant</label>
            <input
              id="tenantIdDisplay"
              type="text"
              className="form-control"
              value={tenantId || ''}
              disabled
            />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Company selection */}
        {/* Hidden input for companyId */}
        <input
          type="hidden"
          {...register('companyId')}
        />

        {/* Optional: Display the companyName as read-only text */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="companyNameDisplay">Company Name</label>
            <input
              id="companyNameDisplay"
              type="text"
              className="form-control"
              value={companyName || ''}
              disabled
            />
          </div>
        </div>


        {/*<div className="col-md-12">*/}
        {/*  <div className="form-group">*/}
        {/*    <label htmlFor="companyId">Company <span className="text-danger">*</span></label>*/}
        {/*    <select*/}
        {/*      id="companyId"*/}
        {/*      className={`form-control ${errors.companyId ? 'is-invalid' : ''}`}*/}
        {/*      {...register('companyId', {*/}
        {/*        required: 'Company is required'*/}
        {/*      })}*/}
        {/*    >*/}
        {/*      <option value="">Select a company</option>*/}
        {/*      {isLoadingCompanies ? (*/}
        {/*        <option disabled>Loading companies...</option>*/}
        {/*      ) : (*/}
        {/*        companies.map(company => (*/}
        {/*          <option key={company.id} value={company.id}>*/}
        {/*            {company.name}*/}
        {/*          </option>*/}
        {/*        ))*/}
        {/*      )}*/}
        {/*    </select>*/}
        {/*    {errors.companyId && (*/}
        {/*      <div className="invalid-feedback">{errors.companyId.message}</div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description <span className="text-danger">*</span></label>
        <textarea
          id="description"
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          {...register('description', {
            required: 'Department description is required',
            minLength: {
              value: 3,
              message: 'Description must be at least 3 characters'
            }
          })}
          rows={3}
        />
        {errors.description && (
          <div className="invalid-feedback">{errors.description.message}</div>
        )}
      </div>

      <div className="form-group d-flex justify-content-end">
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
              {item ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            item ? 'Update Department' : 'Create Department'
          )}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;