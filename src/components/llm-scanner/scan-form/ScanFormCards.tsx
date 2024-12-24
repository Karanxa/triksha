import { Card, CardContent } from "@/components/ui/card";
import { ScanTypeSelect } from "../ScanTypeSelect";
import { ScanFormProvider } from "../ScanFormProvider";
import { ScanPromptInput } from "../ScanPromptInput";
import { BatchScanDataset } from "../components/BatchScanDataset";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { QPSControl } from "../QPSControl";
import { ScanFormSchedule } from "../ScanFormSchedule";

interface ScanFormCardsProps {
  scanType: string;
  onScanTypeChange: (type: string) => void;
  provider: string;
  onProviderChange: (provider: string) => void;
  customEndpoint: any;
  onCustomEndpointChange: (endpoint: any) => void;
  singlePrompt: string;
  onSinglePromptChange: (prompt: string) => void;
  prompts: string[];
  onPromptsChange: (prompts: string[]) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  qps: number;
  onQPSChange: (qps: number) => void;
  schedule: string;
  onScheduleChange: (schedule: string) => void;
  isRecurring: boolean;
  onRecurringChange: (isRecurring: boolean) => void;
}

export const ScanFormCards = ({
  scanType,
  onScanTypeChange,
  provider,
  onProviderChange,
  customEndpoint,
  onCustomEndpointChange,
  singlePrompt,
  onSinglePromptChange,
  prompts,
  onPromptsChange,
  category,
  onCategoryChange,
  qps,
  onQPSChange,
  schedule,
  onScheduleChange,
  isRecurring,
  onRecurringChange
}: ScanFormCardsProps) => {
  return (
    <>
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <ScanTypeSelect scanType={scanType} onScanTypeChange={onScanTypeChange} />
        </CardContent>
      </Card>

      <Card className="border border-border/50">
        <CardContent className="p-6">
          <ScanFormProvider 
            provider={provider}
            onProviderChange={onProviderChange}
            customEndpoint={customEndpoint}
            onCustomEndpointChange={onCustomEndpointChange}
          />
        </CardContent>
      </Card>

      {scanType === "manual" ? (
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <ScanPromptInput
              scanType={scanType}
              singlePrompt={singlePrompt}
              onSinglePromptChange={onSinglePromptChange}
              prompts={prompts}
              onPromptsExtracted={onPromptsChange}
            />
          </CardContent>
        </Card>
      ) : (
        <BatchScanDataset
          prompts={prompts}
          onPromptsExtracted={onPromptsChange}
        />
      )}

      <Card className="border border-border/50">
        <CardContent className="p-6 space-y-6">
          <AttackCategorySelect
            value={category}
            onValueChange={onCategoryChange}
          />

          {scanType === "batch" && (
            <QPSControl qps={qps} onQPSChange={onQPSChange} />
          )}

          <ScanFormSchedule
            schedule={schedule}
            onScheduleChange={onScheduleChange}
            isRecurring={isRecurring}
            onRecurringChange={onRecurringChange}
          />
        </CardContent>
      </Card>
    </>
  );
};