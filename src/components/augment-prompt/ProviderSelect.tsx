import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProviderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const ProviderSelect = ({ value, onValueChange }: ProviderSelectProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Select AI Provider & Model
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select provider and model" />
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

export default ProviderSelect;