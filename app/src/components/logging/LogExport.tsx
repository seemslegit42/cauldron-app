import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  Loader2 
} from 'lucide-react';

interface LogExportProps {
  onExport: (format: 'json' | 'csv') => Promise<void>;
  isLoading: boolean;
}

const LogExport: React.FC<LogExportProps> = ({ onExport, isLoading }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeRelatedLogs: false,
    applyCurrentFilters: true,
    dateRange: 'current', // 'current', 'all', 'custom'
    customStartDate: '',
    customEndDate: '',
    maxRecords: 1000,
  });

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle option change
  const handleOptionChange = (key: keyof typeof exportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setExportFormat('json')}>
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setExportFormat('csv')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Logs</DialogTitle>
          <DialogDescription>
            Configure your export options. This will download logs in {exportFormat.toUpperCase()} format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxRecords" className="text-right">
              Max Records
            </Label>
            <Input
              id="maxRecords"
              type="number"
              className="col-span-3"
              value={exportOptions.maxRecords}
              onChange={(e) => handleOptionChange('maxRecords', parseInt(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date Range</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="currentRange"
                  checked={exportOptions.dateRange === 'current'}
                  onChange={() => handleOptionChange('dateRange', 'current')}
                />
                <Label htmlFor="currentRange">Current filter range</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="allDates"
                  checked={exportOptions.dateRange === 'all'}
                  onChange={() => handleOptionChange('dateRange', 'all')}
                />
                <Label htmlFor="allDates">All dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="customDates"
                  checked={exportOptions.dateRange === 'custom'}
                  onChange={() => handleOptionChange('dateRange', 'custom')}
                />
                <Label htmlFor="customDates">Custom range</Label>
              </div>

              {exportOptions.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                    <div className="flex">
                      <Calendar className="h-4 w-4 mr-2 mt-2" />
                      <Input
                        id="startDate"
                        type="date"
                        value={exportOptions.customStartDate}
                        onChange={(e) => handleOptionChange('customStartDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">End Date</Label>
                    <div className="flex">
                      <Calendar className="h-4 w-4 mr-2 mt-2" />
                      <Input
                        id="endDate"
                        type="date"
                        value={exportOptions.customEndDate}
                        onChange={(e) => handleOptionChange('customEndDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Options</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="applyFilters"
                  checked={exportOptions.applyCurrentFilters}
                  onCheckedChange={(checked) => 
                    handleOptionChange('applyCurrentFilters', checked)
                  }
                />
                <Label htmlFor="applyFilters" className="text-sm">
                  Apply current filters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeMetadata', checked)
                  }
                />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Include metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRelated"
                  checked={exportOptions.includeRelatedLogs}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeRelatedLogs', checked)
                  }
                />
                <Label htmlFor="includeRelated" className="text-sm">
                  Include related logs (by trace ID)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogExport;
