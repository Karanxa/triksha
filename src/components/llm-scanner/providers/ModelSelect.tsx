import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModelSelectProps {
  provider: string;
  selectedProvider: string;
  onModelChange: (model: string) => void;
}

export const ModelSelect = ({ provider, selectedProvider, onModelChange }: ModelSelectProps) => {
  const getModelsForProvider = () => {
    switch (selectedProvider) {
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4 Opus' },
          { value: 'gpt-4o-mini', label: 'GPT-4 Opus Mini' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' }
        ];
      case 'google':
        return [
          { value: 'gemini-1.0-pro', label: 'Gemini Pro' },
          { value: 'gemini-1.0-ultra', label: 'Gemini Ultra' }
        ];
      case 'ollama':
        return [
          { value: 'llama2', label: 'Llama 2' },
          { value: 'mistral', label: 'Mistral' },
          { value: 'codellama', label: 'Code Llama' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-2">
      <Select 
        value={provider.split('-')[1] || ""} 
        onValueChange={onModelChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {getModelsForProvider().map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};