'use client'

import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Company} from '@/services/companyService';

// Type for form data derived from Company interface
type CompanyFormData = Omit<Company, 'id' | 'createdDate' | 'lastUpdatedDate'>;

interface CompanyFormProps {
  item?: Company;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
                                                   item,
                                                   onSubmit,
                                                   onCancel
                                                 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with proper typing
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm<CompanyFormData>({
    defaultValues: item ? {
      name: item.name,
      email: item.email,
      tenantId: item.tenantId || '',
      documentNumber: item.documentNumber || '',
      description: item.description || ''
    } : {
      name: '',
      email: '',
      tenantId: '',
      documentNumber: '',
      description: '',
    },
    mode: 'onBlur', // This enables validation on blur
    reValidateMode: 'onChange' // This will revalidate when the user changes input after an error
  });


  const onFormSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
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
      {/* Form content remains the same */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Company's Name */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="name">Name <span className="text-danger">*</span></label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              {...register('name', {
                required: 'Company name is required',
                minLength: {value: 3, message: 'Name must be at least 3 characters'}
              })}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>
        </div>


        {/* Company's TenantId */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="tenantId">Tenant <span className="text-danger">*</span></label>
            <input
              id="tenantId"
              type="text"
              className={`form-control ${errors.tenantId ? 'is-invalid' : ''}`}
              {...register('tenantId', {
                required: 'Company tenantId is required',
                minLength: {value: 9, message: 'Description must be at least 9 characters'}
              })}
            />
            {errors.tenantId && (
              <div className="invalid-feedback">{errors.tenantId.message}</div>
            )}
          </div>
        </div>
      </div>

      <div className="row">

        {/* Company's Email */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="email">Email <span className="text-danger">*</span></label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>
        </div>

        {/* Document Number (CNPJ) */}
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="documentNumber">CNPJ <span className="text-danger">*</span></label>
            <input
              id="documentNumber"
              type="text"
              className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`}
              {...register('documentNumber', {
                required: 'CNPJ is required',
                pattern: {
                  value: /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/,
                  message: 'Invalid CNPJ format'
                }
              })}
            />
            {errors.documentNumber && (
              <div className="invalid-feedback">{errors.documentNumber.message}</div>
            )}
          </div>
        </div>

      </div>

      <div className="form-group">
        <label htmlFor="description">Description <span className="text-danger">*</span></label>
        <textarea
          id="description"
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          {...register('description', {
            required: 'Company description is required',
            minLength: {
              value: 3,
              message: 'Description must be at least 3 characters'
            }
          })}
          rows={3}
          {...register('description')}
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
            item ? 'Update Company' : 'Create Company'
          )}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;