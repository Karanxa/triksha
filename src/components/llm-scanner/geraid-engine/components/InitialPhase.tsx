import { ModelSelector } from "../ModelSelector";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  return <ModelSelector onStart={onStart} />;
};