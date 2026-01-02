"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";

// Generic types
export interface CrudItem {
  id: string;
  [key: string]: unknown;
}

export interface CrudColumn<T extends CrudItem> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface CrudApi<T extends CrudItem> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

interface AbstractCRUDProps<T extends CrudItem> {
  title: string;
  columns: CrudColumn<T>[];
  api: CrudApi<T>;
  FormComponent: React.ComponentType<{
    item?: T;
    onSubmit: (data: Omit<T, "id">) => Promise<void>;
    onCancel: () => void;
    existingItems?: T[];
    isModal?: boolean;
    onFormSuccess?: (message?: string) => void;
  }>;
  itemName: string;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
  modalSize?: "sm" | "lg" | "xl";
  hideActionsColumnWhenEmpty?: boolean;
}

function AbstractCRUD<T extends CrudItem>({
  title,
  columns,
  api,
  FormComponent,
  itemName,
  canEdit,
  canDelete,
  modalSize = "xl",
  hideActionsColumnWhenEmpty = false,
}: AbstractCRUDProps<T>) {
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<T | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof T | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(`Failed to load ${itemName}s. Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [api, itemName]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsModalAnimating(true);
    setShowForm(true);
    // Remove animation class after animation completes
    setTimeout(() => setIsModalAnimating(false), 300);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsModalAnimating(true);
    setShowForm(true);
    // Remove animation class after animation completes
    setTimeout(() => setIsModalAnimating(false), 300);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("common.messages.confirmDelete"))) {
      try {
        await api.delete(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        setError(`Failed to delete ${itemName}. Please try again.`);
        console.error(err);
      }
    }
  };

  // Using unknown here because this function handles both create and update operations
  // which require different data types (Omit<T, 'id'> for create and Partial<T> for update)
  const handleFormSubmit = async (data: unknown) => {
    try {
      if (editingItem) {
        await api.update(editingItem.id, data);
        await loadItems();
        setShowForm(false);
        setEditingItem(undefined);
      } else {
        await api.create(data);
        await loadItems();
        // For create operations, don't close the form to allow adding more items
        // The form component will handle the success state and reset
      }
    } catch (err) {
      console.error(err);
      throw err; // Let the form component handle the error
    }
  };

  const handleFormCancel = () => {
    setIsModalAnimating(true);
    // Start hide animation
    setTimeout(() => {
      setShowForm(false);
      setEditingItem(undefined);
      setIsModalAnimating(false);
    }, 150); // Shorter delay for closing
  };

  const handleFormSuccess = useCallback((message?: string) => {
    loadItems();
    setShowForm(false);
    setEditingItem(undefined);
    if (message) {
      setToastMessage(message);
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }
  }, [loadItems]);

  // Filter items based on search term
  const filterItems = (items: T[]) => {
    if (!searchTerm) return items;

    return items.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

  // Sort items
  const sortItems = (items: T[]) => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (field: keyof T) => {
    setSortDirection(
      field === sortField && sortDirection === "asc" ? "desc" : "asc",
    );
    setSortField(field);
  };

  // Process items - filter, sort and paginate
  const processedItems = () => {
    const filtered = filterItems(items);
    const sorted = sortItems(filtered);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sorted.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(filterItems(items).length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasAnyActions = (itemsToCheck: T[]) => {
    return itemsToCheck.some(
      (item) => !canEdit || canEdit(item) || !canDelete || canDelete(item),
    );
  };

  const showActionsColumn =
    !hideActionsColumnWhenEmpty || hasAnyActions(processedItems());

  return (
    <div>
      {/* Toast Notification */}
      {showToast && (
        <div className="toast show position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
          <div className={`toast-header bg-${toastType} text-white`}>
            <i className={`fas fa-${toastType === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2`}></i>
            <strong className="mr-auto">{toastType === 'success' ? t('common.status.success') : t('common.status.error')}</strong>
            <button type="button" className="ml-2 mb-1 close text-white" onClick={() => setShowToast(false)}>
              <span>&times;</span>
            </button>
          </div>
          <div className="toast-body">
            {toastMessage}
          </div>
        </div>
      )}

      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {t("common.labels.list")} {itemName}s
              </h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddNew}
                  disabled={showForm}
                >
                  <i className="fas fa-plus mr-1"></i>{" "}
                  {t("common.actions.addNew")} {itemName}
                </button>
              </div>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`${t("common.actions.search")} ${itemName}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key.toString()}
                          className={column.className || ""}
                          onClick={() =>
                            column.sortable
                              ? handleSort(column.key as keyof T)
                              : null
                          }
                          style={{
                            cursor: column.sortable ? "pointer" : "default",
                          }}
                        >
                          {column.label}
                          {column.sortable && sortField === column.key && (
                            <i
                              className={`ml-1 fas fa-sort-${sortDirection === "asc" ? "up" : "down"}`}
                            ></i>
                          )}
                        </th>
                      ))}
                      {showActionsColumn && (
                        <th
                          className="text-nowrap"
                          style={{ minWidth: "140px" }}
                        >
                          {t("common.labels.actions")}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={columns.length + (showActionsColumn ? 1 : 0)}
                          className="text-center"
                        >
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : processedItems().length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + (showActionsColumn ? 1 : 0)}
                          className="text-center"
                        >
                          No {itemName}s found
                        </td>
                      </tr>
                    ) : (
                      processedItems().map((item) => (
                        <tr key={item.id}>
                          {columns.map((column) => (
                            <td
                              key={`${item.id}-${column.key.toString()}`}
                              className={column.className || ""}
                            >
                              {column.render
                                ? column.render(item)
                                : item[column.key as keyof T]?.toString() ||
                                  "-"}
                            </td>
                          ))}
                          {showActionsColumn && (
                            <td
                              className="text-nowrap"
                              style={{ minWidth: "140px" }}
                            >
                              {(!canEdit || canEdit(item)) && (
                                <button
                                  className="btn btn-info btn-sm mr-2"
                                  onClick={() => handleEdit(item)}
                                  disabled={showForm}
                                >
                                  <i className="fas fa-edit"></i>{" "}
                                  {t("common.actions.edit")}
                                </button>
                              )}
                              {(!canDelete || canDelete(item)) && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={showForm}
                                >
                                  <i className="fas fa-trash"></i>{" "}
                                  {t("common.actions.delete")}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <ul className="pagination">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {t("common.actions.previous")}
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ),
                    )}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        {t("common.actions.next")}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <Modal
            isOpen={showForm}
            onClose={handleFormCancel}
            title={
              editingItem
                ? `${t("common.actions.edit")} ${itemName}`
                : `${t("common.actions.addNew")} ${itemName}`
            }
            size={modalSize}
            isAnimating={isModalAnimating}
          >
            <FormComponent
              item={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              existingItems={items}
              isModal={true}
              onFormSuccess={handleFormSuccess}
            />
          </Modal>
        </div>
      </section>
    </div>
  );
}

export default AbstractCRUD;
