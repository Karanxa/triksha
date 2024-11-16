import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { GarakTestSuites } from "@/components/garak/GarakTestSuites";
import { GarakConfig } from "@/components/garak/GarakConfig";
import { GarakResults } from "@/components/garak/GarakResults";
import { useGarakScans } from "@/hooks/useGarakScans";

const GarakScanner = () => {
  const session = useSession();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [selectedTestSuites, setSelectedTestSuites] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [scanName, setScanName] = useState("");
  const { createScan, isScanning } = useGarakScans();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      setPrompts(lines);
      toast.success(`${lines.length} prompts loaded`);
    } catch (error) {
      toast.error("Error processing CSV file");
    }
  };

  const handleScan = async () => {
    if (!session?.user) {
      toast.error("Please sign in to run scans");
      return;
    }

    if (prompts.length === 0) {
      toast.error("Please enter at least one prompt");
      return;
    }

    if (selectedTestSuites.length === 0) {
      toast.error("Please select at least one test suite");
      return;
    }

    try {
      await createScan({
        name: scanName || `Garak Scan ${new Date().toLocaleString()}`,
        model,
        prompts,
        testSuites: selectedTestSuites,
        config
      });
      
      toast.success("Scan initiated successfully");
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error("Failed to run scan: " + (error as Error).message);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Garak Scanner</h1>
      <p className="text-muted-foreground mb-8">
        Test your prompts using Garak's comprehensive security testing suite
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="scanName">Scan Name (Optional)</Label>
              <Input
                id="scanName"
                value={scanName}
                onChange={(e) => setScanName(e.target.value)}
                placeholder="Enter a name for this scan"
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model name (e.g., gpt-3.5-turbo)"
              />
            </div>

            <div>
              <Label>Prompts</Label>
              <div className="space-y-2">
                <Textarea
                  value={prompts.join('\n')}
                  onChange={(e) => setPrompts(e.target.value.split('\n').filter(Boolean))}
                  placeholder="Enter your prompts (one per line)"
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {prompts.length} prompt(s) loaded
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('prompt-csv')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>
                <input
                  id="prompt-csv"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <GarakTestSuites
              selected={selectedTestSuites}
              onSelect={setSelectedTestSuites}
            />

            <GarakConfig
              config={config}
              onChange={setConfig}
            />

            <Button 
              onClick={handleScan} 
              disabled={isScanning || prompts.length === 0}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run Garak Scan"
              )}
            </Button>
          </div>
        </Card>

        <GarakResults />
      </div>
    </div>
  );
};

export default GarakScanner;