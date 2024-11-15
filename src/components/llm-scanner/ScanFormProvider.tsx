import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
}

export const ScanFormProvider = ({ provider, onProviderChange }: ScanFormProviderProps) => {
  return (
    <div className="space-y-4">
      <Label>Select Provider & Model</Label>
      <Select value={provider} onValueChange={onProviderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a provider and model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>OpenAI</SelectLabel>
            <SelectItem value="openai-gpt4o">GPT-4 Optimized</SelectItem>
            <SelectItem value="openai-gpt4o-mini">GPT-4 Mini</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Anthropic</SelectLabel>
            <SelectItem value="anthropic-claude3">Claude 3</SelectItem>
            <SelectItem value="anthropic-claude2">Claude 2</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Google AI</SelectLabel>
            <SelectItem value="google-gemini-pro">Gemini Pro</SelectItem>
            <SelectItem value="google-gemini-ultra">Gemini Ultra</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Ollama</SelectLabel>
            <SelectItem value="ollama-llama2">Llama 2</SelectItem>
            <SelectItem value="ollama-mistral">Mistral</SelectItem>
            <SelectItem value="ollama-codellama">Code Llama</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};