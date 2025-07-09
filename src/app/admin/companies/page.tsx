'use client'

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import CompanyForm from '@/components/admin/companies/CompanyForm';
import { companyApi, Company } from '@/services/companyService';

const CompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Define columns for company table
  const columns: CrudColumn<Company>[] = [
    { key: 'name', label: t('company.columns.name'), sortable: true },
    { key: 'email', label: t('company.columns.email'), sortable: true },
    { key: 'documentNumber', label: t('company.columns.document'), sortable: true },
    { 
      key: 'size', 
      label: t('company.columns.size'), 
      sortable: true,
      render: (company) => company.size ? t(`sizes.${company.size}`) : '-'
    },
    { 
      key: 'industry', 
      label: t('company.columns.industry'), 
      sortable: true,
      render: (company) => company.industry ? t(`industries.${company.industry}`) : '-'
    },
    { 
      key: 'website', 
      label: t('company.columns.website'), 
      sortable: true,
      render: (company) => company.website ? (
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary">
          {company.website.length > 30 ? company.website.substring(0, 30) + '...' : company.website}
        </a>
      ) : '-'
    },
    { 
      key: 'address', 
      label: t('company.columns.city'), 
      sortable: false,
      render: (company) => company.address ? `${company.address.city}, ${company.address.state}` : '-'
    },
    {
      key: 'createdDate',
      label: t('company.columns.created'),
      sortable: true,
      render: (company) => new Date(company.createdDate).toLocaleDateString()
    }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<Company>
        title={t('company.title')}
        columns={columns}
        api={companyApi}
        FormComponent={CompanyForm}
        itemName={t('company.singular')}
      />
    </AdminLayout>
  );
};

export default CompaniesPage;