import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContextualFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  vulnerabilityStatus: string;
  setVulnerabilityStatus: (value: string) => void;
}

export const ContextualFilters = ({
  searchQuery,
  setSearchQuery,
  selectedModel,
  setSelectedModel,
  vulnerabilityStatus,
  setVulnerabilityStatus,
}: ContextualFiltersProps) => {
  return (
    <div className="space-y-6 p-6 animate-filter-slide">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <Input
            placeholder="Search in conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full transition-shadow duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4-0125-preview">GPT-4 Opus</SelectItem>
              <SelectItem value="gpt-3.5-turbo-0125">GPT-4 Opus Mini</SelectItem>
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
      </div>
    </div>
  );
}