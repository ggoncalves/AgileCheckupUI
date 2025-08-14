'use client'

import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {Company, CompanySize, Industry, Gender, GenderPronoun} from '@/services/companyService';

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
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with proper typing
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
    watch
  } = useForm<CompanyFormData>({
    defaultValues: item ? {
      name: item.name,
      email: item.email,
      tenantId: item.tenantId || '',
      documentNumber: item.documentNumber || '',
      description: item.description || '',
      size: item.size || CompanySize.SMALL,
      industry: item.industry || Industry.OTHER,
      website: item.website || '',
      legalName: item.legalName || '',
      phone: item.phone || '',
      contactPerson: item.contactPerson || undefined,
      address: item.address || undefined
    } : {
      name: '',
      email: '',
      tenantId: '',
      documentNumber: '',
      description: '',
      size: CompanySize.SMALL,
      industry: Industry.OTHER,
      website: '',
      legalName: '',
      phone: '',
      contactPerson: undefined,
      address: undefined
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  const hasContactPerson = watch('contactPerson.name') || watch('contactPerson.email') || 
                          watch('contactPerson.documentNumber') || watch('contactPerson.phone');

  const onFormSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure contact person has required fields if provided
      if (data.contactPerson) {
        data.contactPerson.personDocumentType = 'CPF';
      }
      
      await onSubmit(data);
      reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : t('company.form.errors.generic');
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

      {/* Basic Information Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('company.form.sections.basicInfo')}</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="name">{t('company.form.fields.companyName')} <span className="text-danger">*</span></label>
                <input
                  id="name"
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  {...register('name', {
                    required: t('company.form.validation.companyNameRequired'),
                    minLength: {value: 3, message: t('company.form.validation.nameMinLength')}
                  })}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="legalName">{t('company.form.fields.legalName')}</label>
                <input
                  id="legalName"
                  type="text"
                  className="form-control"
                  {...register('legalName')}
                  placeholder="Legal company name (if different from display name)"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="documentNumber">{t('company.form.fields.cnpj')} <span className="text-danger">*</span></label>
                <input
                  id="documentNumber"
                  type="text"
                  className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`}
                  {...register('documentNumber', {
                    required: t('company.form.validation.cnpjRequired'),
                    pattern: {
                      value: /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/,
                      message: t('company.form.validation.cnpjInvalid')
                    }
                  })}
                  placeholder="00.000.000/0000-00"
                />
                {errors.documentNumber && (
                  <div className="invalid-feedback">{errors.documentNumber.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="tenantId">{t('company.form.fields.tenantId')} <span className="text-danger">*</span></label>
                <input
                  id="tenantId"
                  type="text"
                  className={`form-control ${errors.tenantId ? 'is-invalid' : ''}`}
                  {...register('tenantId', {
                    required: t('company.form.validation.tenantIdRequired'),
                    minLength: {value: 9, message: t('company.form.validation.tenantIdMinLength')},
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Tenant ID must be lowercase alphanumeric with hyphens only'
                    }
                  })}
                  placeholder="tenant-company-001"
                />
                {errors.tenantId && (
                  <div className="invalid-feedback">{errors.tenantId.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('company.form.fields.description')} <span className="text-danger">*</span></label>
            <textarea
              id="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              {...register('description', {
                required: t('company.form.validation.descriptionRequired'),
                minLength: {
                  value: 10,
                  message: t('company.form.validation.descriptionMinLength')
                }
              })}
              rows={3}
              placeholder="Brief description of the company and its activities"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description.message}</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="size">{t('company.form.fields.companySize')} <span className="text-danger">*</span></label>
                <select
                  id="size"
                  className={`form-control ${errors.size ? 'is-invalid' : ''}`}
                  {...register('size', {
                    required: t('company.form.validation.sizeRequired')
                  })}
                >
                  <option value="">Select a size...</option>
                  {Object.values(CompanySize).map((size) => (
                    <option key={size} value={size}>
                      {t(`sizes.${size}`)}
                    </option>
                  ))}
                </select>
                {errors.size && (
                  <div className="invalid-feedback">{errors.size.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="industry">{t('company.form.fields.industry')} <span className="text-danger">*</span></label>
                <select
                  id="industry"
                  className={`form-control ${errors.industry ? 'is-invalid' : ''}`}
                  {...register('industry', {
                    required: t('company.form.validation.industryRequired')
                  })}
                >
                  <option value="">Select an industry...</option>
                  {Object.values(Industry).map((industry) => (
                    <option key={industry} value={industry}>
                      {t(`industries.${industry}`)}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <div className="invalid-feedback">{errors.industry.message}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">{t('company.form.sections.contactInfo')}</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email">{t('company.form.fields.companyEmail')} <span className="text-danger">*</span></label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', {
                    required: t('company.form.validation.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="company@example.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="phone">{t('company.form.fields.companyPhone')}</label>
                <input
                  id="phone"
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
                      message: 'Invalid phone number format'
                    }
                  })}
                  placeholder="+55 11 1234-5678"
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="website">{t('company.form.fields.website')}</label>
            <input
              id="website"
              type="url"
              className={`form-control ${errors.website ? 'is-invalid' : ''}`}
              {...register('website', {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: 'Invalid URL format'
                }
              })}
              placeholder="https://www.company.com"
            />
            {errors.website && (
              <div className="invalid-feedback">{errors.website.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">{t('company.form.sections.address')}</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="address.street">{t('company.form.fields.street')}</label>
            <input
              id="address.street"
              type="text"
              className={`form-control ${errors.address?.street ? 'is-invalid' : ''}`}
              {...register('address.street')}
              placeholder="Street name and number"
            />
            {errors.address?.street && (
              <div className="invalid-feedback">{errors.address.street.message}</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="address.city">{t('company.form.fields.city')}</label>
                <input
                  id="address.city"
                  type="text"
                  className={`form-control ${errors.address?.city ? 'is-invalid' : ''}`}
                  {...register('address.city')}
                />
                {errors.address?.city && (
                  <div className="invalid-feedback">{errors.address.city.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="address.state">{t('company.form.fields.state')}</label>
                <input
                  id="address.state"
                  type="text"
                  className={`form-control ${errors.address?.state ? 'is-invalid' : ''}`}
                  {...register('address.state')}
                  placeholder="SP"
                />
                {errors.address?.state && (
                  <div className="invalid-feedback">{errors.address.state.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="address.zipcode">{t('company.form.fields.zipCode')}</label>
                <input
                  id="address.zipcode"
                  type="text"
                  className={`form-control ${errors.address?.zipcode ? 'is-invalid' : ''}`}
                  {...register('address.zipcode', {
                    pattern: {
                      value: /^\d{5}-?\d{3}$/,
                      message: 'Invalid ZIP code format (XXXXX-XXX)'
                    }
                  })}
                  placeholder="00000-000"
                />
                {errors.address?.zipcode && (
                  <div className="invalid-feedback">{errors.address.zipcode.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address.country">{t('company.form.fields.country')}</label>
            <input
              id="address.country"
              type="text"
              className={`form-control ${errors.address?.country ? 'is-invalid' : ''}`}
              {...register('address.country')}
              defaultValue="Brazil"
            />
            {errors.address?.country && (
              <div className="invalid-feedback">{errors.address.country.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Person Section */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">{t('company.form.sections.contactPerson')}</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="contactPerson.name">{t('company.form.fields.name')} <span className="text-danger">*</span></label>
                <input
                  id="contactPerson.name"
                  type="text"
                  className={`form-control ${errors.contactPerson?.name ? 'is-invalid' : ''}`}
                  {...register('contactPerson.name', {
                    required: hasContactPerson ? t('company.form.validation.contactNameRequired') : false
                  })}
                />
                {errors.contactPerson?.name && (
                  <div className="invalid-feedback">{errors.contactPerson.name.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="contactPerson.email">{t('company.form.fields.email')} <span className="text-danger">*</span></label>
                <input
                  id="contactPerson.email"
                  type="email"
                  className={`form-control ${errors.contactPerson?.email ? 'is-invalid' : ''}`}
                  {...register('contactPerson.email', {
                    required: hasContactPerson ? t('company.form.validation.contactEmailRequired') : false,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.contactPerson?.email && (
                  <div className="invalid-feedback">{errors.contactPerson.email.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="contactPerson.documentNumber">{t('company.form.fields.cpf')} <span className="text-danger">*</span></label>
                <input
                  id="contactPerson.documentNumber"
                  type="text"
                  className={`form-control ${errors.contactPerson?.documentNumber ? 'is-invalid' : ''}`}
                  {...register('contactPerson.documentNumber', {
                    required: hasContactPerson ? t('company.form.validation.contactCpfRequired') : false,
                    pattern: {
                      value: /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/,
                      message: 'Invalid CPF format (XXX.XXX.XXX-XX or 11 digits)'
                    }
                  })}
                  placeholder="000.000.000-00"
                />
                {errors.contactPerson?.documentNumber && (
                  <div className="invalid-feedback">{errors.contactPerson.documentNumber.message}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="contactPerson.phone">{t('company.form.fields.phone')}</label>
                <input
                  id="contactPerson.phone"
                  type="tel"
                  className={`form-control ${errors.contactPerson?.phone ? 'is-invalid' : ''}`}
                  {...register('contactPerson.phone', {
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
                      message: 'Invalid phone number format'
                    }
                  })}
                  placeholder="+55 11 98765-4321"
                />
                {errors.contactPerson?.phone && (
                  <div className="invalid-feedback">{errors.contactPerson.phone.message}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="contactPerson.gender">{t('company.form.fields.gender')}</label>
                <select
                  id="contactPerson.gender"
                  className={`form-control ${errors.contactPerson?.gender ? 'is-invalid' : ''}`}
                  {...register('contactPerson.gender')}
                >
                  <option value="">Select gender...</option>
                  {Object.values(Gender).map((gender) => (
                    <option key={gender} value={gender}>
                      {t(`genders.${gender}`)}
                    </option>
                  ))}
                </select>
                {errors.contactPerson?.gender && (
                  <div className="invalid-feedback">{errors.contactPerson.gender.message}</div>
                )}
              </div>
            </div>

            {/*<d-none used to hide genderPronoun in frontend. See: https://ggoncalves.youtrack.cloud/issue/AC-24/>*/}
            <div className="col-md-6 d-none">
              <div className="form-group">
                <label htmlFor="contactPerson.genderPronoun">{t('company.form.fields.pronouns')}</label>
                <select
                  id="contactPerson.genderPronoun"
                  className={`form-control ${errors.contactPerson?.genderPronoun ? 'is-invalid' : ''}`}
                  {...register('contactPerson.genderPronoun')}
                >
                  <option value="">Select pronouns...</option>
                  {Object.values(GenderPronoun).map((pronoun) => (
                    <option key={pronoun} value={pronoun}>
                      {t(`pronouns.${pronoun}`)}
                    </option>
                  ))}
                </select>
                {errors.contactPerson?.genderPronoun && (
                  <div className="invalid-feedback">{errors.contactPerson.genderPronoun.message}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-group d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('company.form.buttons.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
              {item ? t('company.form.buttons.updating') : t('company.form.buttons.creating')}
            </>
          ) : (
            item ? t('company.form.buttons.update') : t('company.form.buttons.create')
          )}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;