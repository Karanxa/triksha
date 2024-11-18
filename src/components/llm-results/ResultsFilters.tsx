import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ATTACK_CATEGORIES } from "../datasets/AttackCategorySelect"
import { ScanType } from "./types"

interface ResultsFiltersProps {
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

const SCAN_TYPES = [
  { value: 'manual_scan', label: 'Manual Scan' },
  { value: 'batch_scan', label: 'Batch Scan' },
  { value: 'garak', label: 'Garak' },
  { value: 'prompt_fuzzer', label: 'Prompt Fuzzer' }
];

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
  setSelectedModel
}: ResultsFiltersProps) => {
  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search in prompts and responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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

        <div className="space-y-2">
          <Label>Scan Type</Label>
          <Select value={selectedScanType} onValueChange={setSelectedScanType}>
            <SelectTrigger>
              <SelectValue placeholder="Select scan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {SCAN_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={vulnerabilityStatus} onValueChange={setVulnerabilityStatus}>
            <SelectTrigger>
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
          <Label>Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4 Opus Mini</SelectItem>
              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
              <SelectItem value="gemini-1.0-pro">Gemini Pro</SelectItem>
              <SelectItem value="gemini-1.0-ultra">Gemini Ultra</SelectItem>
              <SelectItem value="llama2">Llama 2</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
              <SelectItem value="codellama">Code Llama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}