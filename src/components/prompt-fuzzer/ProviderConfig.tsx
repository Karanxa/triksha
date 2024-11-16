import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const llmProviders = [
  "open_ai",
  "bedrock",
  "azure_open_ai",
  "prompt_layer_open_ai",
  "everly_ai",
  "anthropic",
  "cohere",
  "google_palm",
  "mlflow_aigateway",
  "ollama",
  "vertex_ai",
  "jina",
  "mini_max"
];

interface ProviderConfigProps {
  attackProvider: string;
  attackModel: string;
  targetProvider: string;
  targetModel: string;
  onAttackProviderChange: (value: string) => void;
  onAttackModelChange: (value: string) => void;
  onTargetProviderChange: (value: string) => void;
  onTargetModelChange: (value: string) => void;
}

export const ProviderConfig = ({
  attackProvider,
  attackModel,
  targetProvider,
  targetModel,
  onAttackProviderChange,
  onAttackModelChange,
  onTargetProviderChange,
  onTargetModelChange,
}: ProviderConfigProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Attack Provider</Label>
        <Select value={attackProvider} onValueChange={onAttackProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select attack provider" />
          </SelectTrigger>
          <SelectContent>
            {llmProviders.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider.replace(/_/g, ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attack Model</Label>
        <Input
          value={attackModel}
          onChange={(e) => onAttackModelChange(e.target.value)}
          placeholder="Enter attack model name"
        />
      </div>

      <div className="space-y-2">
        <Label>Target Provider</Label>
        <Select value={targetProvider} onValueChange={onTargetProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select target provider" />
          </SelectTrigger>
          <SelectContent>
            {llmProviders.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider.replace(/_/g, ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Model</Label>
        <Input
          value={targetModel}
          onChange={(e) => onTargetModelChange(e.target.value)}
          placeholder="Enter target model name"
        />
      </div>
    </div>
  );
};