import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Filter, X, Download, Columns
} from 'lucide-react';
import { formatDateTime } from '@/app/utils/date';
import { formatIDR } from '@/app/utils/idr-format';

// shadcn/ui components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// ────────────────────────────────────────────────
// Type definitions (unchanged)
export interface Field {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'amount';
  filterable?: boolean;
  sortable?: boolean;
  visible?: boolean;
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
  onFieldsChange?: (fields: Field[]) => void;
  loading?: boolean;
}

// ────────────────────────────────────────────────
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
  onFieldsChange,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // State for delete confirmation
  const [rowToDelete, setRowToDelete] = useState<any | null>(null);

  // Initialize column visibility
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    fields.forEach(field => {
      initial[field.key] = field.visible !== undefined ? field.visible : true;
    });
    return initial;
  });

  const visibleFields = useMemo(() => {
    return fields.filter(field => columnVisibility[field.key] !== false);
  }, [fields, columnVisibility]);

  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility(prev => {
      const newVisibility = { ...prev, [key]: !prev[key] };
      if (onFieldsChange) {
        const updatedFields = fields.map(field => ({
          ...field,
          visible: newVisibility[field.key]
        }));
        onFieldsChange(updatedFields);
      }
      return newVisibility;
    });
  };

  const toggleAllColumns = (visible: boolean) => {
    const newVisibility: Record<string, boolean> = {};
    fields.forEach(field => {
      newVisibility[field.key] = visible;
    });
    setColumnVisibility(newVisibility);

    if (onFieldsChange) {
      const updatedFields = fields.map(field => ({
        ...field,
        visible: visible
      }));
      onFieldsChange(updatedFields);
    }
  };

  // ─── Filtering, Searching, Sorting (unchanged) ───
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    // Search
    if (searchTerm?.trim()) {
      filtered = filtered.filter(row =>
        fields.some(field => {
          const value = row?.[field.key];
          if (value == null) return false;
          try {
            if (field.type === 'date') return formatDateTime(value).toLowerCase().includes(searchTerm.toLowerCase());
            if (field.type === 'amount') return formatIDR(value).toLowerCase().includes(searchTerm.toLowerCase());
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          } catch {
            return false;
          }
        })
      );
    }

    // Local column filters
    Object.entries(localFilters).forEach(([key, val]) => {
      if (!val?.trim()) return;
      filtered = filtered.filter(row => {
        const value = row?.[key];
        if (value == null) return false;
        try {
          const field = fields.find(f => f.key === key);
          if (field?.type === 'date') return formatDateTime(value).toLowerCase().includes(val.toLowerCase());
          if (field?.type === 'amount') return formatIDR(value).toLowerCase().includes(val.toLowerCase());
          return String(value).toLowerCase().includes(val.toLowerCase());
        } catch {
          return false;
        }
      });
    });

    // Sorting
    if (sortConfig?.key) {
      filtered.sort((a, b) => {
        const aVal = a?.[sortConfig.key];
        const bVal = b?.[sortConfig.key];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        try {
          const field = fields.find(f => f.key === sortConfig.key);
          if (field?.type === 'date') {
            const da = new Date(aVal).getTime();
            const db = new Date(bVal).getTime();
            if (isNaN(da)) return 1;
            if (isNaN(db)) return -1;
            return sortConfig.direction === 'asc' ? da - db : db - da;
          }
          if (field?.type === 'amount') {
            const na = typeof aVal === 'string' ? parseFloat(aVal.replace(/[^0-9.-]/g, '')) : aVal;
            const nb = typeof bVal === 'string' ? parseFloat(bVal.replace(/[^0-9.-]/g, '')) : bVal;
            if (isNaN(na)) return 1;
            if (isNaN(nb)) return -1;
            return sortConfig.direction === 'asc' ? na - nb : nb - na;
          }
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } catch {
          return 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, localFilters, sortConfig, fields]);

  const handleSort = (key: string) => {
    if (!key) return;
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleLocalFilter = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value || '' }));
  };

  const clearLocalFilter = (key: string) => {
    setLocalFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const activeLocalFilters = Object.entries(localFilters).filter(([, v]) => v?.trim());
  const visibleColumnsCount = Object.values(columnVisibility).filter(Boolean).length;

  // ─── Delete confirmation logic ───
  const confirmDelete = (row: any) => {
    setRowToDelete(row);
  };

  const handleConfirmedDelete = () => {
    if (rowToDelete && actions.onDelete) {
      actions.onDelete(rowToDelete);
    }
    setRowToDelete(null);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{headerName}</h2>
          {acl.canAdd && (
            <Button onClick={actions.onAdd} variant="default" className='bg-blue-600 hover:bg-blue-700 text-white' size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Baru
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search + Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Columns selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                <Columns className="w-4 h-4 mr-2" />
                Kolom
                <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded-full">
                  {visibleColumnsCount}/{fields.length}
                </span>
              </Button>

              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-64 bg-popover border shadow-md rounded-lg z-50">
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Tampilkan Kolom</h3>
                      <button onClick={() => setShowColumnSelector(false)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button variant="outline" size="sm" onClick={() => toggleAllColumns(true)}>
                        Tampilkan Semua
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleAllColumns(false)}>
                        Sembunyikan Semua
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-1.5">
                    {fields.map(field => (
                      <label
                        key={field.key}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={columnVisibility[field.key] !== false}
                          onChange={() => toggleColumnVisibility(field.key)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {field.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(customFilters.length > 0 || fields.some(f => f.filterable)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeLocalFilters.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                    {activeLocalFilters.length}
                  </span>
                )}
              </Button>
            )}

            {acl.canDownload && (
              <Button variant="outline" size="sm" onClick={actions.onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Unduh
              </Button>
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
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  {visibleFields.map(field => (
                    <th
                      key={field.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${field.sortable ? 'cursor-pointer hover:bg-muted' : ''
                        }`}
                      onClick={() => field.sortable && field.key && handleSort(field.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {field.label}
                        {sortConfig?.key === field.key && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {(acl.canView || acl.canUpdate || acl.canDelete) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {loading ? (
                  <tr>
                    <td colSpan={visibleFields.length + 1} className="px-6 py-10 text-center text-muted-foreground">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={visibleFields.length + 1} className="px-6 py-10 text-center text-muted-foreground">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr key={row.id ?? idx} className="hover:bg-muted/30">
                      {visibleFields.map(field => (
                        <td key={field.key} className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {field.render
                            ? field.render(row[field.key], row)
                            : field.type === 'date'
                              ? formatDateTime(row[field.key])
                              : field.type === 'amount'
                                ? formatIDR(row[field.key])
                                : (row[field.key] ?? '-')}
                        </td>
                      ))}

                      {(acl.canView || acl.canUpdate || acl.canDelete) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex gap-1.5 justify-end">
                            {acl.canView && actions.onView && (
                              <Button variant="ghost" size="icon" onClick={() => actions.onView?.(row)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {acl.canUpdate && actions.onUpdate && (
                              <Button variant="ghost" size="icon" onClick={() => actions.onUpdate?.(row)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {acl.canDelete && actions.onDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => confirmDelete(row)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah kamu yakin ingin menghapus data ini?
                                      Aksi ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleConfirmedDelete}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
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