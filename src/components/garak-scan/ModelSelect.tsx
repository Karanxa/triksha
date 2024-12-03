import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ModelSelectProps {
  modelType: string;
  modelName: string;
  onModelTypeChange: (value: string) => void;
  onModelNameChange: (value: string) => void;
}

const MODEL_TYPES = [
  { value: "huggingface", label: "Hugging Face" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" }
];

export const ModelSelect = ({ 
  modelType, 
  modelName, 
  onModelTypeChange, 
  onModelNameChange 
}: ModelSelectProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Model Type</Label>
        <Select value={modelType} onValueChange={onModelTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select model type" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Model Name</Label>
        <Input
          value={modelName}
          onChange={(e) => onModelNameChange(e.target.value)}
          placeholder={modelType === 'huggingface' ? 'e.g., gpt2' : 'Enter model name'}
        />
      </div>
    </div>
  );
};