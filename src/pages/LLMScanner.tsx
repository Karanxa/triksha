import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowRight } from "lucide-react";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { useLLMScans } from "@/hooks/useLLMScans";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const LLMScanner = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isBatchScan, setIsBatchScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { createScan, isScanning } = useLLMScans();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].toLowerCase().split(",");
      const promptIndex = headers.indexOf("prompts");

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts' column");
        return;
      }

      const prompts = lines.slice(1).map(line => line.split(",")[promptIndex]).filter(Boolean);
      setPrompt(prompts.join("\n"));
      setIsBatchScan(true);
    };

    reader.readAsText(file);
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

    try {
      const result = await createScan({
        prompt,
        provider,
        category,
        label: label || undefined,
        schedule: schedule || undefined,
        isRecurring
      });
      
      if (!isBatchScan) {
        setScanResult(result);
        toast.success("Scan completed successfully");
      } else {
        toast.success("Batch scan initiated successfully");
        navigate("/llm-results");
      }
      
      // Reset form
      setPrompt("");
      setLabel("");
      setSchedule("");
      setIsRecurring(false);
      setIsBatchScan(false);
    } catch (error) {
      toast.error("Failed to create scan: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">LLM Scanner</h1>
        
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
              onChange={(e) => {
                setPrompt(e.target.value);
                setIsBatchScan(false);
              }}
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

          <div className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSubmit}
              disabled={isScanning}
            >
              {isScanning ? "Starting Scan..." : "Start LLM Scan"}
            </Button>
          </div>

          {scanResult && !isBatchScan && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Scan Results</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Risk Level</Label>
                    <p className="font-medium">{scanResult.risk_level}</p>
                  </div>
                  {scanResult.vulnerabilities?.map((vuln: any, index: number) => (
                    <div key={index}>
                      <Label className="text-sm text-muted-foreground">Vulnerability {index + 1}</Label>
                      <p className="font-medium">{vuln.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type: {vuln.type} | Severity: {vuln.severity}
                      </p>
                    </div>
                  ))}
                  {scanResult.recommendations?.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Recommendations</Label>
                      <ul className="list-disc list-inside">
                        {scanResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isBatchScan && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/llm-results")}
            >
              View Batch Scan Results <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LLMScanner;