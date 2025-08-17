'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import { teamService, Team } from '@/services/teamService';
import { departmentApi, Department } from '@/services/departmentService';
import { TeamForm } from '@/components/teams/TeamForm';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load departments for rendering department names
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deps = await departmentApi.getAll();
        setDepartments(deps);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Create department lookup map
  const departmentMap = new Map<string, string>();
  departments.forEach(dept => {
    departmentMap.set(dept.id, dept.name);
  });

  // Define columns for team table
  const columns: CrudColumn<Team>[] = [
    { key: 'name', label: t('team.columns.name'), sortable: true, className: 'col-md-4' },
    { key: 'description', label: t('team.columns.description'), sortable: true, className: 'col-md-4' },
    {
      key: 'departmentId',
      label: t('team.columns.department'),
      sortable: true,
      className: 'col-md-3',
      render: (team) => (
        <span className="badge badge-info">
          {departmentMap.get(team.departmentId) || t('team.messages.noDepartment')}
        </span>
      )
    }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<Team>
        title={t('team.title')}
        columns={columns}
        api={teamService}
        FormComponent={TeamForm}
        itemName={t('team.singular')}
      />
    </AdminLayout>
  );
};

export default TeamsPage;