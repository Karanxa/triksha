import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FuzzingFormHeaderProps {
  name: string;
  setName: (value: string) => void;
  basePrompt: string;
  setBasePrompt: (value: string) => void;
}

export const FuzzingFormHeader = ({ name, setName, basePrompt, setBasePrompt }: FuzzingFormHeaderProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Scan Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter scan name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="basePrompt">Base Prompt</Label>
        <Textarea
          id="basePrompt"
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          placeholder="Enter the system prompt you want to test"
          className="min-h-[100px]"
          required
        />
      </div>
    </>
  );
};