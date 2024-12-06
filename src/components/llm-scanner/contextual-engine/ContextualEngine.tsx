import { ModelSelector } from "../ModelSelector";
import { GeraidConfig } from "./types";

export const ContextualEngine = () => {
  const handleStart = async (config: GeraidConfig) => {
    // Handle the start of the contextual analysis with the provided configuration
    // This function will be implemented to initiate the analysis process
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Contextual Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a target model and dataset to begin. This will help understand the model's capabilities and test it against your dataset.
        </p>
      </div>
      <ModelSelector onStart={handleStart} />
    </div>
  );
};
