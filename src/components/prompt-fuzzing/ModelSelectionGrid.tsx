import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModelSelectionGridProps {
  config: {
    attack_provider: string;
    attack_model: string;
    target_provider: string;
    target_model: string;
  };
  setConfig: (config: any) => void;
}

export const ModelSelectionGrid = ({ config, setConfig }: ModelSelectionGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Attack Provider</Label>
        <Select 
          value={config.attack_provider}
          onValueChange={(value) => setConfig(prev => ({ ...prev, attack_provider: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select attack provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attack Model</Label>
        <Select 
          value={config.attack_model}
          onValueChange={(value) => setConfig(prev => ({ ...prev, attack_model: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select attack model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Provider</Label>
        <Select 
          value={config.target_provider}
          onValueChange={(value) => setConfig(prev => ({ ...prev, target_provider: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select target provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Model</Label>
        <Select 
          value={config.target_model}
          onValueChange={(value) => setConfig(prev => ({ ...prev, target_model: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select target model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};