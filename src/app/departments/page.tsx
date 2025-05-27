'use client'

import React, {useEffect, useState} from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AbstractCRUD, {CrudColumn} from '@/components/common/AbstractCRUD';
import DepartmentForm from '@/components/departments/DepartmentForm';
import {Department, departmentApi} from '@/services/departmentService';
import {companyApi} from '@/services/companyService';

const DepartmentsPage: React.FC = () => {
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
    { key: 'name', label: 'Department Name', sortable: true },
    { 
      key: 'companyId', 
      label: 'Company', 
      sortable: true,
      render: (department) => companies.get(department.companyId) || department.companyId
    },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'tenantId', label: 'Tenant', sortable: true },
    {
      key: 'createdDate',
      label: 'Created Date',
      sortable: true,
      render: (department) => new Date(department.createdDate).toLocaleDateString()
    }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<Department>
        title="Department Management"
        columns={columns}
        api={departmentApi}
        FormComponent={DepartmentForm}
        itemName="Department"
      />
    </AdminLayout>
  );
};

export default DepartmentsPage;