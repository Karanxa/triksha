import { ModelSelector } from "../ModelSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");

  const handleStart = () => {
    onStart({
      provider,
      model,
      datasetId: "" // Since we're not using dataset selection for now
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configure Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Select a model to begin the analysis process.
          </p>
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={setProvider}
            onModelChange={setModel}
          />
          <Button 
            onClick={handleStart}
            className="w-full"
            disabled={!provider || !model}
          >
            Start Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};