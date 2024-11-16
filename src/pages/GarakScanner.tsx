import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GarakScanner = () => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleScan = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt to test");
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('garak-scan', {
        body: { prompt, model }
      });

      if (error) throw error;

      setResults(data);
      toast.success("Garak scan completed");
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error("Failed to run Garak scan: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Garak Scanner</h1>
      <p className="text-muted-foreground mb-8">
        Test your prompts using Garak's comprehensive security testing suite
      </p>

      <Card className="p-6">
        <div className="space-y-4">
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
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt to test"
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleScan} 
            disabled={isScanning || !prompt}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Garak Tests...
              </>
            ) : (
              "Run Garak Scan"
            )}
          </Button>
        </div>

        {results && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Scan Results</h2>
            <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[500px]">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GarakScanner;