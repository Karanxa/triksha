import { Control, Controller, useFormContext } from "react-hook-form";
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
import { Input } from "@/components/ui/input";

export interface ModelSelectProps {
  name: string;
  label: string;
  placeholder: string;
  provider?: string;
  onModelChange?: (model: string) => void;
}

export const ModelSelect = ({
  name,
  label,
  placeholder,
  provider,
  onModelChange,
}: ModelSelectProps) => {
  const form = useFormContext();

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
      default:
        return [];
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {provider === 'custom' ? (
              <Input
                placeholder="Enter model name or identifier"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  if (onModelChange) {
                    onModelChange(e.target.value);
                  }
                }}
              />
            ) : (
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
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};