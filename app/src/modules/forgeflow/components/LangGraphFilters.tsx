import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@src/shared/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@src/shared/components/ui/popover';
import { Button } from '@src/shared/components/ui/button';
import { Calendar } from '@src/shared/components/ui/calendar';
import { Badge } from '@src/shared/components/ui/badge';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { format } from 'date-fns';

export interface LangGraphFiltersProps {
  onFilterChange: (filters: LangGraphFilters) => void;
  className?: string;
}

export interface LangGraphFilters {
  status?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  workflowType?: string;
  search?: string;
}

export const LangGraphFilters: React.FC<LangGraphFiltersProps> = ({
  onFilterChange,
  className = '',
}) => {
  const [filters, setFilters] = useState<LangGraphFilters>({});
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle date range change
  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDate(range);
    const newFilters = {
      ...filters,
      dateRange: range,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle workflow type change
  const handleWorkflowTypeChange = (value: string) => {
    const newFilters = {
      ...filters,
      workflowType: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = {
      ...filters,
      search: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setDate({ from: undefined, to: undefined });
    onFilterChange({});
  };
  
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {/* Status Filter */}
      <div>
        <Select 
          value={filters.status} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Date Range Filter */}
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Workflow Type Filter */}
      <div>
        <Select 
          value={filters.workflowType} 
          onValueChange={handleWorkflowTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Workflow Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="threat_research">Threat Research</SelectItem>
            <SelectItem value="content_generation">Content Generation</SelectItem>
            <SelectItem value="data_analysis">Data Analysis</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Search */}
      <div className="flex-grow">
        <Input
          placeholder="Search workflows..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      
      {/* Clear Filters */}
      {(filters.status || filters.dateRange?.from || filters.workflowType || filters.search) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="h-10"
        >
          Clear Filters
        </Button>
      )}
      
      {/* Active Filters */}
      <div className="w-full flex flex-wrap gap-2 mt-2">
        {filters.status && (
          <Badge variant="secondary" className="text-xs">
            Status: {filters.status}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const { status, ...rest } = filters;
                setFilters(rest);
                onFilterChange(rest);
              }}
            >
              ×
            </button>
          </Badge>
        )}
        
        {filters.dateRange?.from && (
          <Badge variant="secondary" className="text-xs">
            Date: {format(filters.dateRange.from, "LLL dd, y")}
            {filters.dateRange.to && ` - ${format(filters.dateRange.to, "LLL dd, y")}`}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const { dateRange, ...rest } = filters;
                setDate({ from: undefined, to: undefined });
                setFilters(rest);
                onFilterChange(rest);
              }}
            >
              ×
            </button>
          </Badge>
        )}
        
        {filters.workflowType && (
          <Badge variant="secondary" className="text-xs">
            Type: {filters.workflowType}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const { workflowType, ...rest } = filters;
                setFilters(rest);
                onFilterChange(rest);
              }}
            >
              ×
            </button>
          </Badge>
        )}
        
        {filters.search && (
          <Badge variant="secondary" className="text-xs">
            Search: {filters.search}
            <button
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const { search, ...rest } = filters;
                setFilters(rest);
                onFilterChange(rest);
              }}
            >
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
};
