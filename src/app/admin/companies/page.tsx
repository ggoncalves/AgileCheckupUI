'use client'

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import CompanyForm from '@/components/admin/companies/CompanyForm';
import { companyApi, Company } from '@/services/companyService';

const CompaniesPage: React.FC = () => {
  // Define columns for company table
  const columns: CrudColumn<Company>[] = [
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'documentNumber', label: 'Document', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'tenantId', label: 'Tenant', sortable: true },
    {
      key: 'createdDate',
      label: 'CreatedDate',
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