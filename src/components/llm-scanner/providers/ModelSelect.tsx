import { Control, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ModelSelectProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  provider?: string;
  onModelChange?: (model: string) => void;
}

export const ModelSelect = ({
  control,
  name,
  label,
  placeholder,
  provider,
  onModelChange,
}: ModelSelectProps) => {
  const getModelOptions = () => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4 Opus' },
          { value: 'gpt-4o-mini', label: 'GPT-4 Opus Mini' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        ];
      case 'google':
        return [
          { value: 'gemini-1.0-pro', label: 'Gemini Pro' },
          { value: 'gemini-1.0-ultra', label: 'Gemini Ultra' },
        ];
      case 'ollama':
        return [
          { value: 'llama2', label: 'Llama 2' },
          { value: 'mistral', label: 'Mistral' },
          { value: 'codellama', label: 'Code Llama' },
        ];
      default:
        return [
          { value: 'gpt-4o', label: 'GPT-4 Opus' },
          { value: 'gpt-4o-mini', label: 'GPT-4 Opus Mini' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'gemini-1.0-pro', label: 'Gemini Pro' },
          { value: 'gemini-1.0-ultra', label: 'Gemini Ultra' },
          { value: 'llama2', label: 'Llama 2' },
          { value: 'mistral', label: 'Mistral' },
          { value: 'codellama', label: 'Code Llama' },
        ];
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (onModelChange) {
                  onModelChange(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {getModelOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};