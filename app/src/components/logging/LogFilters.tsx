import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { LogLevel, EventCategory } from '../../shared/services/logging';

interface LogFiltersProps {
  filters: {
    startDate: Date;
    endDate: Date;
    level: LogLevel[];
    category: EventCategory[];
    userId: string;
    agentId: string;
    search: string;
    tags: string[];
    limit: number;
  };
  onChange: (filters: Partial<LogFiltersProps['filters']>) => void;
}

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  // Log levels
  const logLevels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
  
  // Event categories
  const eventCategories: EventCategory[] = [
    'AGENT_ACTION',
    'HUMAN_APPROVAL',
    'API_INTERACTION',
    'SYSTEM_EVENT',
    'SECURITY',
    'PERFORMANCE',
    'DATA_ACCESS',
    'AUTHENTICATION',
    'AUTHORIZATION',
    'BUSINESS_LOGIC',
    'INTEGRATION',
    'SCHEDULED_TASK'
  ];

  // Handle level toggle
  const handleLevelToggle = (level: LogLevel) => {
    if (filters.level.includes(level)) {
      onChange({ level: filters.level.filter(l => l !== level) });
    } else {
      onChange({ level: [...filters.level, level] });
    }
  };

  // Handle category toggle
  const handleCategoryToggle = (category: EventCategory) => {
    if (filters.category.includes(category)) {
      onChange({ category: filters.category.filter(c => c !== category) });
    } else {
      onChange({ category: [...filters.category, category] });
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      const newTag = e.currentTarget.value.trim();
      if (newTag && !filters.tags.includes(newTag)) {
        onChange({ tags: [...filters.tags, newTag] });
        e.currentTarget.value = '';
      }
    }
  };

  // Handle tag removal
  const handleTagRemove = (tag: string) => {
    onChange({ tags: filters.tags.filter(t => t !== tag) });
  };

  // Handle reset filters
  const handleReset = () => {
    onChange({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      level: [],
      category: [],
      userId: '',
      agentId: '',
      search: '',
      tags: [],
      limit: 100,
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(filters.startDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => date && onChange({ startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(filters.endDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => date && onChange({ endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Log Levels */}
      <div className="space-y-2">
        <Label>Log Levels</Label>
        <div className="flex flex-wrap gap-2">
          {logLevels.map((level) => (
            <Badge
              key={level}
              variant={filters.level.includes(level) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleLevelToggle(level)}
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      {/* Event Categories */}
      <div className="space-y-2">
        <Label>Event Categories</Label>
        <Select
          onValueChange={(value) => handleCategoryToggle(value as EventCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {eventCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.category.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category)}
            >
              {category.replace('_', ' ')}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      </div>

      {/* User ID */}
      <div className="space-y-2">
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          value={filters.userId}
          onChange={(e) => onChange({ userId: e.target.value })}
          placeholder="Filter by user ID"
        />
      </div>

      {/* Agent ID */}
      <div className="space-y-2">
        <Label htmlFor="agentId">Agent ID</Label>
        <Input
          id="agentId"
          value={filters.agentId}
          onChange={(e) => onChange({ agentId: e.target.value })}
          placeholder="Filter by agent ID"
        />
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search in messages"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="Add tag and press Enter"
          onKeyDown={handleTagInput}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleTagRemove(tag)}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Limit */}
      <div className="space-y-2">
        <Label htmlFor="limit">Result Limit</Label>
        <Select
          value={filters.limit.toString()}
          onValueChange={(value) => onChange({ limit: parseInt(value) })}
        >
          <SelectTrigger id="limit">
            <SelectValue placeholder="Select limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50 logs</SelectItem>
            <SelectItem value="100">100 logs</SelectItem>
            <SelectItem value="250">250 logs</SelectItem>
            <SelectItem value="500">500 logs</SelectItem>
            <SelectItem value="1000">1000 logs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default LogFilters;
