'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AssessmentMatrixForm from '../../components/assessmentmatrices/AssessmentMatrixForm';
import AssessmentMatrixStructureModal from '../../components/assessmentmatrices/AssessmentMatrixStructureModal';
import { assessmentMatrixService, AssessmentMatrix, Pillar } from '@/services/assessmentMatrixService';
import { performanceCycleService, PerformanceCycle } from '@/services/performanceCycleService';
import { useTenant } from '@/contexts/TenantContext';

const AssessmentMatrixPage: React.FC = () => {
  const { tenantId } = useTenant();
  const [matrices, setMatrices] = useState<AssessmentMatrix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AssessmentMatrix | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerformanceCycleId, setSelectedPerformanceCycleId] = useState<string>('');
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>([]);
  const [sortField, setSortField] = useState<keyof AssessmentMatrix | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMatrixForStructure, setSelectedMatrixForStructure] = useState<AssessmentMatrix | null>(null);
  const [showStructureModal, setShowStructureModal] = useState(false);

  // Load assessment matrices
  const loadMatrices = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    try {
      const data = await assessmentMatrixService.getAll();
      setMatrices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load assessment matrices. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadMatrices();
  }, [loadMatrices]);

  useEffect(() => {
    const fetchPerformanceCycles = async () => {
      try {
        const cycles = await performanceCycleService.getAll();
        const activeCycles = cycles.filter(cycle => cycle.isActive);
        setPerformanceCycles(activeCycles);
      } catch (error) {
        console.error('Error fetching performance cycles:', error);
      }
    };

    fetchPerformanceCycles();
  }, []);

  const handleAddNew = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: AssessmentMatrix) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment matrix?')) {
      try {
        await assessmentMatrixService.delete(id);
        await loadMatrices();
      } catch (err) {
        console.error('Error deleting assessment matrix:', err);
        alert('Failed to delete assessment matrix. Please try again.');
      }
    }
  };

  const handleSubmit = async (data: Partial<AssessmentMatrix>) => {
    try {
      if (editingItem) {
        await assessmentMatrixService.update(editingItem.id, data);
      } else {
        await assessmentMatrixService.create(data);
      }
      setShowForm(false);
      setEditingItem(undefined);
      await loadMatrices();
    } catch (err) {
      console.error('Error saving assessment matrix:', err);
      throw err;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  const handleShowStructure = (matrix: AssessmentMatrix) => {
    setSelectedMatrixForStructure(matrix);
    setShowStructureModal(true);
  };

  const handleCloseStructureModal = () => {
    setShowStructureModal(false);
    setSelectedMatrixForStructure(null);
  };

  // Filter items based on search term and selected performance cycle
  const filterItems = (items: AssessmentMatrix[]) => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPerformanceCycle = selectedPerformanceCycleId === '' || 
        item.performanceCycleId === selectedPerformanceCycleId;
      
      return matchesSearch && matchesPerformanceCycle;
    });
  };

  // Sort items
  const sortItems = (items: AssessmentMatrix[]) => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortField as keyof AssessmentMatrix];
      const bValue = b[sortField as keyof AssessmentMatrix];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: keyof AssessmentMatrix) => {
    setSortDirection(
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };

  // Process items - filter, sort and paginate
  const processedItems = () => {
    const filtered = filterItems(matrices);
    const sorted = sortItems(filtered);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sorted.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(filterItems(matrices).length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPillarMap = (pillarMap: { [key: string]: Pillar }) => {
    if (!pillarMap || Object.keys(pillarMap).length === 0) {
      return 'No pillars defined';
    }
    
    const pillarCount = Object.keys(pillarMap).length;
    const categoryCount = Object.values(pillarMap).reduce((total, pillar) => {
      return total + (pillar.categoryMap ? Object.keys(pillar.categoryMap).length : 0);
    }, 0);
    
    return `${pillarCount} pillar${pillarCount !== 1 ? 's' : ''}, ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`;
  };

  const getPerformanceCycleName = (cycleId: string) => {
    const cycle = performanceCycles.find(c => c.id === cycleId);
    return cycle ? cycle.name : cycleId;
  };

  return (
    <AdminLayout>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Assessment Matrices</h1>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {showForm ? (
            <AssessmentMatrixForm
              matrix={editingItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              selectedPerformanceCycleId={selectedPerformanceCycleId}
            />
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Assessment Matrices</h3>
                <div className="card-tools">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddNew}
                  >
                    <i className="fas fa-plus mr-1"></i> Add New
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
                        value={selectedPerformanceCycleId}
                        onChange={(e) => setSelectedPerformanceCycleId(e.target.value)}
                      >
                        <option value="">All Performance Cycles</option>
                        {performanceCycles.map(cycle => (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.name}
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
                        placeholder="Search Assessment Matrices..."
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
                          Name
                          {sortField === 'name' && (
                            <i className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th 
                          onClick={() => handleSort('description')}
                          style={{ cursor: 'pointer' }}
                        >
                          Description
                          {sortField === 'description' && (
                            <i className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th 
                          onClick={() => handleSort('performanceCycleId')}
                          style={{ cursor: 'pointer' }}
                        >
                          Performance Cycle
                          {sortField === 'performanceCycleId' && (
                            <i className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th>Structure</th>
                        <th 
                          onClick={() => handleSort('questionCount')}
                          style={{ cursor: 'pointer' }}
                        >
                          Questions
                          {sortField === 'questionCount' && (
                            <i className={`ml-1 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : processedItems().length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No assessment matrices found
                          </td>
                        </tr>
                      ) : (
                        processedItems().map((matrix) => (
                          <tr key={matrix.id}>
                            <td>{matrix.name}</td>
                            <td>{matrix.description || '-'}</td>
                            <td>{getPerformanceCycleName(matrix.performanceCycleId)}</td>
                            <td>
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{formatPillarMap(matrix.pillarMap)}</span>
                                <button
                                  className="btn btn-sm btn-outline-info ml-2"
                                  onClick={() => handleShowStructure(matrix)}
                                  title="View structure details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </td>
                            <td>{matrix.questionCount || 0}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => handleEdit(matrix)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(matrix.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="row">
                    <div className="col-sm-12 col-md-7">
                      <div className="dataTables_paginate paging_simple_numbers">
                        <ul className="pagination">
                          <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => (
                            <li
                              key={index + 1}
                              className={`paginate_button page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(index + 1)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`paginate_button page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {selectedMatrixForStructure && (
        <AssessmentMatrixStructureModal
          matrix={selectedMatrixForStructure}
          isOpen={showStructureModal}
          onClose={handleCloseStructureModal}
        />
      )}
    </AdminLayout>
  );
};

export default AssessmentMatrixPage;