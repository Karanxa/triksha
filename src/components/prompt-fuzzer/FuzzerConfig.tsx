import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FuzzerConfigProps {
  numAttempts: number;
  numThreads: number;
  attackTemperature: number;
  onNumAttemptsChange: (value: number) => void;
  onNumThreadsChange: (value: number) => void;
  onAttackTemperatureChange: (value: number) => void;
}

export const FuzzerConfig = ({
  numAttempts,
  numThreads,
  attackTemperature,
  onNumAttemptsChange,
  onNumThreadsChange,
  onAttackTemperatureChange,
}: FuzzerConfigProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of Attempts ({numAttempts})</Label>
        <Slider
          value={[numAttempts]}
          onValueChange={([value]) => onNumAttemptsChange(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Threads ({numThreads})</Label>
        <Slider
          value={[numThreads]}
          onValueChange={([value]) => onNumThreadsChange(value)}
          min={1}
          max={8}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Attack Temperature ({attackTemperature})</Label>
        <Slider
          value={[attackTemperature]}
          onValueChange={([value]) => onAttackTemperatureChange(value)}
          min={0}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>
    </div>
  );
};