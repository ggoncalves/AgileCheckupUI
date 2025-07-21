'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/infrastructure/layouts';
import { teamService, Team } from '@/services/teamService';
import { departmentApi, Department } from '@/services/departmentService';
import { TeamForm } from '@/components/teams/TeamForm';
import { useTenant } from '@/infrastructure/auth';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Team | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Team | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!tenantId) return;
      
      try {
        const deps = await departmentApi.getAll();
        setDepartments(deps);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };

    fetchDepartments();
  }, [tenantId]);

  // Load teams
  const loadTeams = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    try {
      const data = await teamService.getAll();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError(t('team.errors.loadFailed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create department lookup map
  // const _departmentMap = useMemo(() => {
  //   const map = new Map<string, string>();
  //   departments.forEach(dept => {
  //     map.set(dept.id, dept.name);
  //   });
  //   return map;
  // }, [departments]);

  const handleAddNew = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: Team) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.messages.confirmDelete'))) {
      try {
        await teamService.delete(id);
        setTeams(teams.filter(item => item.id !== id));
      } catch (err) {
        setError(t('team.errors.deleteFailed'));
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (data: Omit<Team, 'id'>) => {
    try {
      if (editingItem) {
        await teamService.update(editingItem.id, data);
      } else {
        await teamService.create(data);
      }
      await loadTeams();
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

  // Filter teams based on search term and department
  const filterTeams = (teams: Team[]) => {
    let filtered = teams;

    // Filter by department
    if (selectedDepartmentId !== 'all') {
      filtered = filtered.filter(team => team.department?.id === selectedDepartmentId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(team =>
        Object.values(team).some(
          value =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  // Sort teams
  const sortTeams = (teams: Team[]) => {
    if (!sortField) return teams;

    return [...teams].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      // Special handling for department sorting
      if (sortField === 'department') {
        aValue = a.department?.name || '';
        bValue = b.department?.name || '';
      } else {
        aValue = a[sortField as keyof Team];
        bValue = b[sortField as keyof Team];
      }

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: keyof Team) => {
    setSortDirection(
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  const processedTeams = sortTeams(filterTeams(teams));

  return (
    <AdminLayout>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                <i className="fas fa-users mr-2"></i>
                {t('team.title')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('common.labels.list')} {t('team.plural')}</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddNew}
                  disabled={showForm}
                >
                  <i className="fas fa-plus mr-1"></i> {t('common.actions.addNew')} {t('team.singular')}
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
                        <i className="fas fa-building"></i>
                      </span>
                    </div>
                    <select
                      className="form-control"
                      value={selectedDepartmentId}
                      onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    >
                      <option value="all">{t('team.filters.allDepartments')}</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('team.search.placeholder')}
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
                        {t('team.columns.name')}
                        {sortField === 'name' && (
                          <i
                            className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}
                          ></i>
                        )}
                      </th>
                      <th>{t('team.columns.description')}</th>
                      <th
                        onClick={() => handleSort('department')}
                        style={{ cursor: 'pointer' }}
                      >
                        {t('team.columns.department')}
                        {sortField === 'department' && (
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
                        <td colSpan={4} className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">{t('common.status.loading')}</span>
                          </div>
                        </td>
                      </tr>
                    ) : processedTeams.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center">
                          {t('team.messages.noTeamsFound')}
                        </td>
                      </tr>
                    ) : (
                      processedTeams.map((team) => (
                        <tr key={team.id}>
                          <td>{team.name}</td>
                          <td>{team.description || <em className="text-muted">{t('team.messages.noDescription')}</em>}</td>
                          <td>
                            <span className="badge badge-info">
                              {team.department?.name || t('team.messages.noDepartment')}
                            </span>
                          </td>
                          <td className="text-nowrap">
                            <button
                              className="btn btn-info btn-sm mr-2"
                              onClick={() => handleEdit(team)}
                              disabled={showForm}
                            >
                              <i className="fas fa-edit"></i> {t('common.actions.edit')}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(team.id)}
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
              <TeamForm
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

export default TeamsPage;