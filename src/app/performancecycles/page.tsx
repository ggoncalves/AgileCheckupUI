'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import AbstractCRUD, { CrudColumn } from '@/components/common/AbstractCRUD';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { PerformanceCycleForm } from '@/components/performancecycles/PerformanceCycleForm';

const PerformanceCyclesPage: React.FC = () => {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Define columns for performance cycle table
  const columns: CrudColumn<PerformanceCycle>[] = [
    { key: 'name', label: t('performanceCycle.columns.name'), sortable: true, className: 'col-md-2' },
    { key: 'description', label: t('performanceCycle.columns.description'), sortable: true, className: 'col-md-3' },
    {
      key: 'startDate',
      label: t('performanceCycle.columns.startDate'),
      sortable: true,
      className: 'col-md-2',
      render: (cycle) => formatDate(cycle.startDate)
    },
    {
      key: 'endDate',
      label: t('performanceCycle.columns.endDate'),
      sortable: true,
      className: 'col-md-2',
      render: (cycle) => formatDate(cycle.endDate)
    },
    {
      key: 'isTimeSensitive',
      label: t('performanceCycle.columns.type'),
      sortable: true,
      className: 'col-md-1',
      render: (cycle) => (
        cycle.isTimeSensitive ? (
          <span className="badge badge-warning">
            <i className="fas fa-clock mr-1"></i>
            {t('performanceCycle.types.timeSensitive')}
          </span>
        ) : (
          <span className="badge badge-info">
            <i className="fas fa-infinity mr-1"></i>
            {t('performanceCycle.types.ongoing')}
          </span>
        )
      )
    },
    {
      key: 'isActive',
      label: t('performanceCycle.columns.status'),
      sortable: true,
      className: 'col-md-1',
      render: (cycle) => (
        cycle.isActive ? (
          <span className="badge badge-success">
            <i className="fas fa-check-circle mr-1"></i>
            {t('performanceCycle.status.active')}
          </span>
        ) : (
          <span className="badge badge-secondary">
            <i className="fas fa-times-circle mr-1"></i>
            {t('performanceCycle.status.inactive')}
          </span>
        )
      )
    }
  ];

  return (
    <AdminLayout>
      <AbstractCRUD<PerformanceCycle>
        title={t('performanceCycle.title')}
        columns={columns}
        api={performanceCycleService}
        FormComponent={PerformanceCycleForm}
        itemName={t('performanceCycle.singular')}
      />
    </AdminLayout>
  );
};

export default PerformanceCyclesPage;