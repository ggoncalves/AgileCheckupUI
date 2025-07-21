'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { PerformanceCycleForm } from '@/components/performancecycles/PerformanceCycleForm';
import { useTenant } from '@/infrastructure/auth';

const PerformanceCyclesPage: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useTenant();
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PerformanceCycle | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<keyof PerformanceCycle | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load performance cycles
  const loadCycles = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    try {
      const data = await performanceCycleService.getAll();
      setCycles(data);
      setError(null);
    } catch (err) {
      setError(t('performanceCycle.errors.loadFailed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddNew = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: PerformanceCycle) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.messages.confirmDelete'))) {
      try {
        await performanceCycleService.delete(id);
        setCycles(cycles.filter(item => item.id !== id));
      } catch (err) {
        setError(t('performanceCycle.errors.deleteFailed'));
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (data: Omit<PerformanceCycle, 'id'>) => {
    try {
      if (editingItem) {
        await performanceCycleService.update(editingItem.id, data);
      } else {
        await performanceCycleService.create(data);
      }
      await loadCycles();
      setShowForm(false);
      setEditingItem(undefined);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  // Filter cycles based on search term and active status
  const filterCycles = (cycles: PerformanceCycle[]) => {
    let filtered = cycles;

    // Filter by active status
    if (filterActive !== 'all') {
      filtered = filtered.filter(cycle => 
        filterActive === 'active' ? cycle.isActive : !cycle.isActive
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cycle =>
        cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cycle.description && cycle.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  // Sort cycles
  const sortCycles = (cycles: PerformanceCycle[]) => {
    if (!sortField) return cycles;

    return [...cycles].sort((a, b) => {
      const aValue = a[sortField as keyof PerformanceCycle];
      const bValue = b[sortField as keyof PerformanceCycle];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: keyof PerformanceCycle) => {
    setSortDirection(
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  const processedCycles = sortCycles(filterCycles(cycles));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <AdminLayout>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                <i className="fas fa-sync-alt mr-2"></i>
                {t('performanceCycle.title')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('performanceCycle.plural')}</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddNew}
                  disabled={showForm}
                >
                  <i className="fas fa-plus mr-1"></i> {t('common.actions.addNew')} {t('performanceCycle.singular')}
                </button>
              </div>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fas fa-filter"></i>
                      </span>
                    </div>
                    <select
                      className="form-control"
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                    >
                      <option value="all">{t('performanceCycle.filters.allCycles')}</option>
                      <option value="active">{t('performanceCycle.filters.activeOnly')}</option>
                      <option value="inactive">{t('performanceCycle.filters.inactiveOnly')}</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('performanceCycle.search.placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer' }}
                      >
                        {t('performanceCycle.columns.name')}
                        {sortField === 'name' && (
                          <i
                            className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}
                          ></i>
                        )}
                      </th>
                      <th>{t('performanceCycle.columns.description')}</th>
                      <th
                        onClick={() => handleSort('startDate')}
                        style={{ cursor: 'pointer' }}
                      >
                        {t('performanceCycle.columns.startDate')}
                        {sortField === 'startDate' && (
                          <i
                            className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}
                          ></i>
                        )}
                      </th>
                      <th
                        onClick={() => handleSort('endDate')}
                        style={{ cursor: 'pointer' }}
                      >
                        {t('performanceCycle.columns.endDate')}
                        {sortField === 'endDate' && (
                          <i
                            className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}
                          ></i>
                        )}
                      </th>
                      <th>{t('performanceCycle.columns.type')}</th>
                      <th
                        onClick={() => handleSort('isActive')}
                        style={{ cursor: 'pointer' }}
                      >
                        {t('performanceCycle.columns.status')}
                        {sortField === 'isActive' && (
                          <i
                            className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}
                          ></i>
                        )}
                      </th>
                      <th className="text-nowrap" style={{ minWidth: '140px' }}>{t('common.labels.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">{t('common.status.loading')}</span>
                          </div>
                        </td>
                      </tr>
                    ) : processedCycles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          {t('performanceCycle.messages.noCyclesFound')}
                        </td>
                      </tr>
                    ) : (
                      processedCycles.map((cycle) => (
                        <tr key={cycle.id}>
                          <td>{cycle.name}</td>
                          <td>{cycle.description || <em className="text-muted">{t('performanceCycle.messages.noDescription')}</em>}</td>
                          <td>{formatDate(cycle.startDate)}</td>
                          <td>{formatDate(cycle.endDate)}</td>
                          <td>
                            {cycle.isTimeSensitive ? (
                              <span className="badge badge-warning">
                                <i className="fas fa-clock mr-1"></i>
                                {t('performanceCycle.types.timeSensitive')}
                              </span>
                            ) : (
                              <span className="badge badge-info">
                                <i className="fas fa-infinity mr-1"></i>
                                {t('performanceCycle.types.ongoing')}
                              </span>
                            )}
                          </td>
                          <td>
                            {cycle.isActive ? (
                              <span className="badge badge-success">
                                <i className="fas fa-check-circle mr-1"></i>
                                {t('performanceCycle.status.active')}
                              </span>
                            ) : (
                              <span className="badge badge-secondary">
                                <i className="fas fa-times-circle mr-1"></i>
                                {t('performanceCycle.status.inactive')}
                              </span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            <button
                              className="btn btn-info btn-sm mr-2"
                              onClick={() => handleEdit(cycle)}
                              disabled={showForm}
                            >
                              <i className="fas fa-edit"></i> {t('common.actions.edit')}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(cycle.id)}
                              disabled={showForm}
                            >
                              <i className="fas fa-trash"></i> {t('common.actions.delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="mt-4">
              <PerformanceCycleForm
                item={editingItem}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default PerformanceCyclesPage;