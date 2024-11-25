import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HttpRequestInput } from "./HttpRequestInput";
import { ManualInput } from "./ManualInput";
import { CurlInput } from "./CurlInput";
import { CustomEndpoint } from "../types/CustomEndpoint";

export interface CustomEndpointInputProps {
  customEndpoint: CustomEndpoint;
  onCustomEndpointChange: (endpoint: Partial<CustomEndpoint>) => void;
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
          onValueChange={(value: 'curl' | 'manual' | 'http') => {
            onInputTypeChange(value);
            // Reset relevant fields when changing input type
            onCustomEndpointChange({
              ...customEndpoint,
              inputType: value,
              curlCommand: value === 'curl' ? customEndpoint.curlCommand : '',
              httpRequest: value === 'http' ? customEndpoint.httpRequest : '',
              url: value === 'manual' ? customEndpoint.url : '',
              apiKey: value === 'manual' ? customEndpoint.apiKey : '',
              headers: value === 'manual' ? customEndpoint.headers : '',
            });
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="http" id="http" />
            <Label htmlFor="http">HTTP Request</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="curl" id="curl" />
            <Label htmlFor="curl">cURL Command</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manual Configuration</Label>
          </div>
        </RadioGroup>
      </div>

      {inputType === 'http' && (
        <HttpRequestInput
          httpRequest={customEndpoint.httpRequest || ''}
          placeholder={customEndpoint.placeholder || '{PROMPT}'}
          onHttpRequestChange={(value) => onCustomEndpointChange({ ...customEndpoint, httpRequest: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ ...customEndpoint, placeholder: value })}
        />
      )}

      {inputType === 'curl' && (
        <CurlInput
          curlCommand={customEndpoint.curlCommand || ''}
          placeholder={customEndpoint.placeholder || '{PROMPT}'}
          onCurlCommandChange={(value) => onCustomEndpointChange({ ...customEndpoint, curlCommand: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ ...customEndpoint, placeholder: value })}
        />
      )}

      {inputType === 'manual' && (
        <ManualInput
          url={customEndpoint.url || ''}
          apiKey={customEndpoint.apiKey || ''}
          headers={customEndpoint.headers || ''}
          placeholder={customEndpoint.placeholder || '{PROMPT}'}
          onUrlChange={(value) => onCustomEndpointChange({ ...customEndpoint, url: value })}
          onApiKeyChange={(value) => onCustomEndpointChange({ ...customEndpoint, apiKey: value })}
          onHeadersChange={(value) => onCustomEndpointChange({ ...customEndpoint, headers: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ ...customEndpoint, placeholder: value })}
        />
      )}
    </div>
  );
};