import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FuzzingControlsProps {
  config: {
    num_attempts: number;
    num_threads: number;
    attack_temperature: number;
  };
  setConfig: (config: any) => void;
}

export const FuzzingControls = ({ config, setConfig }: FuzzingControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of Attempts: {config.num_attempts}</Label>
        <Slider
          value={[config.num_attempts]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, num_attempts: value }))}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Threads: {config.num_threads}</Label>
        <Slider
          value={[config.num_threads]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, num_threads: value }))}
          min={1}
          max={8}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Attack Temperature: {config.attack_temperature}</Label>
        <Slider
          value={[config.attack_temperature]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, attack_temperature: value }))}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
    </div>
  );
};