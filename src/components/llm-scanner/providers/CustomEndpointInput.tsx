import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HttpRequestInput } from "./HttpRequestInput";
import { ManualInput } from "./ManualInput";
import { CurlInput } from "./CurlInput";
import { CustomEndpoint } from "../types/CustomEndpoint";

interface CustomEndpointInputProps {
  customEndpoint: CustomEndpoint;
  onCustomEndpointChange: (endpoint: Partial<CustomEndpoint>) => void;
}

export const CustomEndpointInput = ({ 
  customEndpoint,
  onCustomEndpointChange
}: CustomEndpointInputProps) => {
  const handleInputTypeChange = (value: 'curl' | 'manual' | 'http') => {
    onCustomEndpointChange({
      inputType: value,
      url: '',
      apiKey: '',
      headers: '',
      curlCommand: '',
      httpRequest: '',
      placeholder: '{PROMPT}',
      method: 'POST'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Method</Label>
        <RadioGroup
          value={customEndpoint.inputType}
          onValueChange={(value: 'curl' | 'manual' | 'http') => handleInputTypeChange(value)}
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

      {customEndpoint.inputType === 'http' && (
        <HttpRequestInput
          httpRequest={customEndpoint.httpRequest}
          placeholder={customEndpoint.placeholder}
          onHttpRequestChange={(value) => onCustomEndpointChange({ httpRequest: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ placeholder: value })}
        />
      )}

      {customEndpoint.inputType === 'curl' && (
        <CurlInput
          curlCommand={customEndpoint.curlCommand}
          placeholder={customEndpoint.placeholder}
          onCurlCommandChange={(value) => onCustomEndpointChange({ curlCommand: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ placeholder: value })}
        />
      )}

      {customEndpoint.inputType === 'manual' && (
        <ManualInput
          url={customEndpoint.url}
          apiKey={customEndpoint.apiKey}
          headers={customEndpoint.headers}
          placeholder={customEndpoint.placeholder}
          onUrlChange={(value) => onCustomEndpointChange({ url: value })}
          onApiKeyChange={(value) => onCustomEndpointChange({ apiKey: value })}
          onHeadersChange={(value) => onCustomEndpointChange({ headers: value })}
          onPlaceholderChange={(value) => onCustomEndpointChange({ placeholder: value })}
        />
      )}
    </div>
  );
};