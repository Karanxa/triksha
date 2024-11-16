import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Model {
  value: string;
  label: string;
}

interface ModelSelectProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (value: string) => void;
}

export const ModelSelect = ({ models, selectedModel, onModelChange }: ModelSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Select Model</Label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};