'use client'

import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import AbstractCRUD, {CrudColumn} from '@/components/common/AbstractCRUD';
import DepartmentForm from '@/components/departments/DepartmentForm';
import {Department, departmentApi} from '@/services/departmentService';
import {companyApi} from '@/services/companyService';

const DepartmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Map<string, string>>(new Map());

  // Fetch companies to display names instead of IDs
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await companyApi.getAll();
        const companyMap = new Map<string, string>();
        companiesData.forEach(company => {
          companyMap.set(company.id, company.name);
        });
        setCompanies(companyMap);
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    };

    loadCompanies();
  }, []);

  // Define columns for department table
  const columns: CrudColumn<Department>[] = [
    {
      key: 'companyId',
      label: t('department.columns.company'),
      sortable: true,
      className: 'col-md-3',
      render: (department) => companies.get(department.companyId) || department.companyId
    },
    { key: 'name', label: t('department.columns.name'), sortable: true, className: 'col-md-4' },
    { key: 'description', label: t('department.columns.description'), sortable: true, className: 'col-md-5' }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<Department>
        title={t('department.title')}
        columns={columns}
        api={departmentApi}
        FormComponent={DepartmentForm}
        itemName={t('department.singular')}
      />
    </AdminLayout>
  );
};

export default DepartmentsPage;