import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Filter, X, Download } from 'lucide-react';

// Type definitions
export interface Field {
  key: string;
  label: string;
  filterable?: boolean;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ACLControl {
  canView?: boolean;
  canAdd?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canDownload?: boolean;
}

export interface ACLActions {
  onView?: (row: any) => void;
  onAdd?: () => void;
  onUpdate?: (row: any) => void;
  onDelete?: (row: any) => void;
  onDownload?: () => void;
}

export interface CustomFilter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface DataTableProps {
  fields: Field[];
  data: any[];
  headerName?: string;
  acl?: ACLControl;
  actions?: ACLActions;
  customFilters?: CustomFilter[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  fields,
  data,
  headerName = 'Data Table',
  acl = {
    canView: true,
    canAdd: true,
    canUpdate: true,
    canDelete: true,
    canDownload: false,
  },
  actions = {},
  customFilters = [],
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Local search filtering
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter((row) => {
        if (!row) return false;
        return fields.some((field) => {
          if (!field || !field.key) return false;
          const value = row[field.key];
          if (value === null || value === undefined) return false;
          try {
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          } catch (e) {
            return false;
          }
        });
      });
    }

    // Apply local filters
    Object.entries(localFilters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue.trim()) {
        filtered = filtered.filter((row) => {
          if (!row) return false;
          const value = row[key];
          if (value === null || value === undefined) return false;
          try {
            return value.toString().toLowerCase().includes(filterValue.toLowerCase());
          } catch (e) {
            return false;
          }
        });
      }
    });

    // Apply sorting
    if (sortConfig && sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        try {
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } catch (e) {
          return 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, localFilters, sortConfig, fields]);

  const handleSort = (key: string) => {
    if (!key) return;
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleLocalFilter = (key: string, value: string) => {
    if (!key) return;
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || '',
    }));
  };

  const clearLocalFilter = (key: string) => {
    if (!key) return;
    setLocalFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeLocalFilters = Object.entries(localFilters || {}).filter(([_, value]) => value && value.trim());

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{headerName}</h2>
          {acl.canAdd && (
            <button
              onClick={actions.onAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search and Filters Bar */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {(customFilters.length > 0 || fields.some(f => f.filterable)) && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeLocalFilters.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                    {activeLocalFilters.length}
                  </span>
                )}
              </button>
            )}

            {acl.canDownload && (
              <button
                onClick={actions.onDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom Filters (API-based) */}
              {customFilters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600">Custom Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {customFilters.map((filter) => (
                      <div key={filter.key}>
                        <label className="text-xs text-gray-600 mb-1 block">
                          {filter.label}
                        </label>

                        
                        <select
                          onChange={(e) => filter.onFilterChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Column Filters */}
              {fields.filter(f => f.filterable).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600">Column Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {fields
                      .filter((field) => field.filterable)
                      .map((field) => (
                        <div key={field.key} className="relative">
                          <label className="text-xs text-gray-600 mb-1 block">
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={`Filter by ${field.label}`}
                              value={localFilters[field.key] || ''}
                              onChange={(e) => handleLocalFilter(field.key, e.target.value)}
                              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {localFilters[field.key] && (
                              <button
                                onClick={() => clearLocalFilter(field.key)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {fields && fields.length > 0 && fields.map((field) => (
                    <th
                      key={field?.key || Math.random()}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        field?.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => field?.sortable && field?.key && handleSort(field.key)}
                    >
                      <div className="flex items-center gap-2">
                        {field?.label || ''}
                        {field?.sortable && sortConfig?.key === field?.key && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {(acl?.canView || acl?.canUpdate || acl?.canDelete) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={(fields?.length || 0) + 1} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : !filteredData || filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={(fields?.length || 0) + 1} className="px-6 py-8 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => {
                    if (!row) return null;
                    return (
                      <tr key={row.id || idx} className="hover:bg-gray-50">
                        {fields && fields.length > 0 && fields.map((field) => {
                          if (!field || !field.key) return null;
                          const value = row[field.key];
                          return (
                            <td key={field.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {field.render ? (
                                (() => {
                                  try {
                                    return field.render(value, row);
                                  } catch (e) {
                                    return value ?? '-';
                                  }
                                })()
                              ) : (
                                value ?? '-'
                              )}
                            </td>
                          );
                        })}
                        {(acl?.canView || acl?.canUpdate || acl?.canDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2 justify-end">
                              {acl?.canView && actions?.onView && (
                                <button
                                  onClick={() => actions.onView?.(row)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {acl?.canUpdate && actions?.onUpdate && (
                                <button
                                  onClick={() => actions.onUpdate?.(row)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {acl?.canDelete && actions?.onDelete && (
                                <button
                                  onClick={() => actions.onDelete?.(row)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                {((pagination.currentPage - 1) * pagination.pageSize) + 1}-
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
