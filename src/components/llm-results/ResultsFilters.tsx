import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ATTACK_CATEGORIES } from "@/components/datasets/AttackCategorySelect";
import { DateRange } from "react-day-picker";

interface ResultsFiltersProps {
  filterType: string;
  setFilterType: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: DateRange | { from: Date; to: Date }) => void;
  onExport: () => void;
  resultsCount?: number;
}

export const ResultsFilters = ({
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  onExport,
  resultsCount
}: ResultsFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-48">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="manual">Manual Prompt</SelectItem>
              <SelectItem value="batch">Batch Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ATTACK_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Input
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <DatePickerWithRange
          date={dateRange}
          onDateChange={(range) => setDateRange(range)}
        />

        <Button variant="secondary" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>

      {typeof resultsCount !== 'undefined' && (
        <p className="text-sm text-muted-foreground">
          Showing {resultsCount} results
        </p>
      )}
    </div>
  );
};