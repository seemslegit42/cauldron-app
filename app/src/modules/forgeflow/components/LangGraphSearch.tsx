import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@src/shared/components/ui/input';
import { Button } from '@src/shared/components/ui/button';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@src/shared/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@src/shared/components/ui/popover';
import { useQuery } from 'wasp/client/operations';
import { getUserWorkflowExecutions } from '../api/operations';
import { format } from 'date-fns';

export interface LangGraphSearchProps {
  onSelect: (executionId: string) => void;
  className?: string;
  placeholder?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  workflow: {
    name: string;
  };
  langGraphState?: {
    name: string;
  };
}

export const LangGraphSearch: React.FC<LangGraphSearchProps> = ({
  onSelect,
  className = '',
  placeholder = 'Search workflows...',
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Query for user workflow executions
  const { 
    data: executions, 
    isLoading, 
    error 
  } = useQuery(getUserWorkflowExecutions);
  
  // Filter executions based on search value
  const filteredExecutions = executions?.filter((execution: WorkflowExecution) => {
    const searchLower = searchValue.toLowerCase();
    return (
      execution.workflow.name.toLowerCase().includes(searchLower) ||
      execution.id.toLowerCase().includes(searchLower) ||
      (execution.langGraphState?.name || '').toLowerCase().includes(searchLower)
    );
  });
  
  // Handle selection
  const handleSelect = useCallback((executionId: string) => {
    onSelect(executionId);
    setOpen(false);
  }, [onSelect]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {placeholder}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Search workflows..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No workflows found.</CommandEmpty>
              <CommandGroup heading="Recent Workflows">
                {isLoading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : error ? (
                  <div className="p-2 text-center text-sm text-red-500">
                    Error loading workflows
                  </div>
                ) : (
                  filteredExecutions?.map((execution: WorkflowExecution) => (
                    <CommandItem
                      key={execution.id}
                      value={execution.id}
                      onSelect={() => handleSelect(execution.id)}
                      className="flex flex-col items-start py-3"
                    >
                      <div className="flex w-full justify-between items-center">
                        <span className="font-medium">
                          {execution.workflow.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {execution.langGraphState?.name || 'Unnamed Graph'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Started: {formatDate(execution.startedAt)}
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
