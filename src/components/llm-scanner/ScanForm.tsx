import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { toast } from "sonner";

interface ScanFormProps {
  onSubmit: (data: {
    prompt: string;
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
  }) => Promise<void>;
  isScanning: boolean;
  onFileUpload: (file: File) => void;
}

export const ScanForm = ({ onSubmit, isScanning, onFileUpload }: ScanFormProps) => {
  const [provider, setProvider] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    onFileUpload(file);
  };

  const handleSubmit = async () => {
    if (!provider) {
      toast.error("Please select a provider");
      return;
    }

    if (!prompt) {
      toast.error("Please enter a prompt or upload a CSV");
      return;
    }

    if (!category) {
      toast.error("Please select an attack category");
      return;
    }

    await onSubmit({
      prompt,
      provider,
      category,
      label: label || undefined,
      schedule: schedule || undefined,
      isRecurring
    });

    // Reset form
    setPrompt("");
    setLabel("");
    setSchedule("");
    setIsRecurring(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Select Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Single Prompt</Label>
        <Textarea 
          placeholder="Enter your prompt for scanning"
          className="min-h-[100px]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Or Upload CSV with Prompts</Label>
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </Label>
          <p className="text-sm text-muted-foreground mt-2">
            CSV must have a "prompts" column
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Attack Category</Label>
        <AttackCategorySelect
          value={category}
          onValueChange={setCategory}
        />
      </div>

      <div className="space-y-4">
        <Label>Scan Label (Optional)</Label>
        <Input 
          placeholder="Enter a label for this scan"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          If provided, all prompts in this scan will be tagged with this label
        </p>
      </div>

      <div className="space-y-4">
        <Label>Schedule (cron expression)</Label>
        <Input 
          placeholder="/5 * * * *"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter a cron expression (e.g., "/5 * * * *" for every 5 minutes)
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Recurring scan</Label>
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSubmit}
        disabled={isScanning}
      >
        {isScanning ? "Starting Scan..." : "Start LLM Scan"}
      </Button>
    </div>
  );
};