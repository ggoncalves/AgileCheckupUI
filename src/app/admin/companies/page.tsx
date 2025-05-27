'use client'

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import CompanyForm from '@/components/admin/companies/CompanyForm';
import { companyApi, Company, getCompanySizeLabel, getIndustryLabel } from '@/services/companyService';

const CompaniesPage: React.FC = () => {
  // Define columns for company table
  const columns: CrudColumn<Company>[] = [
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'documentNumber', label: 'Document', sortable: true },
    { 
      key: 'size', 
      label: 'Size', 
      sortable: true,
      render: (company) => company.size ? getCompanySizeLabel(company.size) : '-'
    },
    { 
      key: 'industry', 
      label: 'Industry', 
      sortable: true,
      render: (company) => company.industry ? getIndustryLabel(company.industry) : '-'
    },
    { 
      key: 'website', 
      label: 'Website', 
      sortable: true,
      render: (company) => company.website ? (
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary">
          {company.website.length > 30 ? company.website.substring(0, 30) + '...' : company.website}
        </a>
      ) : '-'
    },
    { 
      key: 'address', 
      label: 'City', 
      sortable: false,
      render: (company) => company.address ? `${company.address.city}, ${company.address.state}` : '-'
    },
    {
      key: 'createdDate',
      label: 'Created',
      sortable: true,
      render: (company) => new Date(company.createdDate).toLocaleDateString()
    }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<Company>
        title="Company Management"
        columns={columns}
        api={companyApi}
        FormComponent={CompanyForm}
        itemName="Company"
      />
    </AdminLayout>
  );
};

export default CompaniesPage;