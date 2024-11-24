import { ModelSelector } from "../ModelSelector";
import { Card, CardContent } from "@/components/ui/card";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configure Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Select a model and dataset to begin the analysis process.
          </p>
          <ModelSelector onStart={onStart} />
        </div>
      </CardContent>
    </Card>
  );
};