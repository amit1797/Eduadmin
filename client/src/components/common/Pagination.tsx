import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize || 1));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className || ""}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows per page:</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-3">{start}-{end} of {total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onPageChange(1)} disabled={!canPrev}>
          « First
        </Button>
        <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
          ‹ Prev
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={!canNext}>
          Next ›
        </Button>
        <Button variant="outline" onClick={() => onPageChange(totalPages)} disabled={!canNext}>
          Last »
        </Button>
      </div>
    </div>
  );
};
