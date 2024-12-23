import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CurlInput } from "./CurlInput";

export interface CustomEndpointInputProps {
  customEndpoint: any;
  onCustomEndpointChange: (endpoint: any) => void;
  inputType: 'curl' | 'manual' | 'http';
  onInputTypeChange: (type: 'curl' | 'manual' | 'http') => void;
}

export const CustomEndpointInput = ({
  customEndpoint,
  onCustomEndpointChange,
  inputType,
  onInputTypeChange,
}: CustomEndpointInputProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Method</Label>
        <RadioGroup
          value={inputType}
          onValueChange={(value: 'curl' | 'manual' | 'http') => onInputTypeChange(value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="curl" id="curl" />
            <Label htmlFor="curl">cURL Command</Label>
          </div>
        </RadioGroup>
      </div>

      <CurlInput
        curlCommand={customEndpoint?.curlCommand || ''}
        placeholder={customEndpoint?.placeholder || '{PROMPT}'}
        onCurlCommandChange={(value) => onCustomEndpointChange({ ...customEndpoint, curlCommand: value })}
        onPlaceholderChange={(value) => onCustomEndpointChange({ ...customEndpoint, placeholder: value })}
      />
    </div>
  );
};