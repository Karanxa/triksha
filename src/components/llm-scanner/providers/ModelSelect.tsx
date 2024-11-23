import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface ModelSelectProps {
  name: string;
  label: string;
  placeholder: string;
  control: Control<any>;
}

export const ModelSelect = ({ name, label, placeholder, control }: ModelSelectProps) => {
  const getModelsForProvider = () => {
    return [
      { value: 'gpt-4o', displayName: 'GPT-4 Opus' },
      { value: 'gpt-4o-mini', displayName: 'GPT-4 Opus Mini' },
      { value: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
      { value: 'gemini-1.0-pro', displayName: 'Gemini Pro' },
      { value: 'gemini-1.0-ultra', displayName: 'Gemini Ultra' },
      { value: 'llama2', displayName: 'Llama 2' },
      { value: 'mistral', displayName: 'Mistral' },
      { value: 'codellama', displayName: 'Code Llama' }
    ];
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProvider().map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.displayName}
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