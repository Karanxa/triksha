import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectProps {
  provider: string;
  onModelChange: (model: string) => void;
}

export const ModelSelect = ({ provider, onModelChange }: ModelSelectProps) => {
  const getModelsForProvider = () => {
    switch (provider.split('-')[0]) {
      case 'openai':
        return [
          { value: 'gpt-4o', displayName: 'GPT-4 Opus' },
          { value: 'gpt-4o-mini', displayName: 'GPT-4 Opus Mini' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
        ];
      case 'google':
        return [
          { value: 'gemini-1.0-pro', displayName: 'Gemini Pro' },
          { value: 'gemini-1.0-ultra', displayName: 'Gemini Ultra' },
        ];
      case 'ollama':
        return [
          { value: 'llama2', displayName: 'Llama 2' },
          { value: 'mistral', displayName: 'Mistral' },
          { value: 'codellama', displayName: 'Code Llama' },
        ];
      default:
        return [];
    }
  };

  const handleModelChange = (value: string) => {
    onModelChange(value);
  };

  const currentValue = provider.split('-')[1] || "";

  return (
    <div className="space-y-4">
      <Label>Model</Label>
      <Select
        value={currentValue}
        onValueChange={handleModelChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {getModelsForProvider().map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};