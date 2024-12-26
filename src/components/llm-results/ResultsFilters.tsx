import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ResultsFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedScanType: string;
  setSelectedScanType: (value: string) => void;
  vulnerabilityStatus: string;
  setVulnerabilityStatus: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
}

export const ResultsFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedScanType,
  setSelectedScanType,
  vulnerabilityStatus,
  setVulnerabilityStatus,
  selectedModel,
  setSelectedModel,
}: ResultsFiltersProps) => {
  return (
    <div className="space-y-6 animate-filter-slide">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <Input
            placeholder="Search in prompts and responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full transition-shadow duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
              <SelectItem value="jailbreaking">Jailbreaking</SelectItem>
              <SelectItem value="data-leakage">Data Leakage</SelectItem>
              <SelectItem value="model-behavior">Model Behavior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Scan Type</Label>
          <Select value={selectedScanType} onValueChange={setSelectedScanType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual_scan">Manual Scan</SelectItem>
              <SelectItem value="batch_scan">Batch Scan</SelectItem>
              <SelectItem value="scheduled_scan">Scheduled Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={vulnerabilityStatus} onValueChange={setVulnerabilityStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="vulnerable">Vulnerable</SelectItem>
              <SelectItem value="secure">Secure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
              <SelectItem value="claude-2">Claude 2</SelectItem>
              <SelectItem value="llama-2">Llama 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};