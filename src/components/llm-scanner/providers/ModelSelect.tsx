import { Control } from "react-hook-form";
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

interface ModelSelectProps {
  name: string;
  label: string;
  placeholder: string;
  control: Control<any>;
  provider: string;
  onModelChange: (model: string) => void;
}

export const ModelSelect = ({
  name,
  label,
  placeholder,
  control,
  provider,
  onModelChange,
}: ModelSelectProps) => {
  const getModelOptions = (provider: string) => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4 Optimized' },
          { value: 'gpt-4o-mini', label: 'GPT-4 Mini' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-2', label: 'Claude 2' },
          { value: 'claude-instant', label: 'Claude Instant' },
        ];
      case 'gemini':
        return [
          { value: 'gemini-pro', label: 'Gemini Pro' },
        ];
      default:
        return [];
    }
  };

  const models = getModelOptions(provider);

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
                onModelChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
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