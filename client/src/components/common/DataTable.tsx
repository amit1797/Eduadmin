import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from './LoadingStates';
import { cn } from '@/lib/utils';
import { TableColumn, TableProps } from '@/types';

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  rowKey = 'id',
  onRowClick,
  searchable = false,
  filterable = false,
  className
}: TableProps<T> & {
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      columns.some(column => {
        const value = getNestedValue(item, column.key as string);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] || index);
  };

  if (loading) {
    return <TableSkeleton rows={10} columns={columns.length} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex items-center gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={String(column.key) || index}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-gray-100'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                sortedData.map((record, index) => (
                  <tr
                    key={getRowKey(record, index)}
                    className={cn(
                      'hover:bg-gray-50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={String(column.key) || colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(getNestedValue(record, String(column.key)), record, index)
                          : String(getNestedValue(record, String(column.key)) || '')
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={pagination.onChange}
        />
      )}
    </div>
  );
}

// Pagination component
interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

function Pagination({
  current,
  total,
  pageSize,
  onChange,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100]
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    onChange(1, parseInt(newPageSize));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {total} results
      </div>
      
      <div className="flex items-center space-x-2">
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={current === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(current - 1)}
            disabled={current === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="px-3 py-1 text-sm">
            Page {current} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(current + 1)}
            disabled={current === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={current === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Utility function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
