import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useLLMScans } from "@/hooks/useLLMScans";
import { useGarakScans } from "@/hooks/useGarakScans";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { GarakScanForm } from "@/components/llm-scanner/GarakScanForm";
import { PromptFuzzerForm } from "@/components/prompt-fuzzer/PromptFuzzerForm";
import { ScanResults } from "@/components/llm-scanner/ScanResults";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const LLMScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<any>(null);
  const { createScan, isScanning } = useLLMScans();
  const { createScan: createGarakScan, isScanning: isGarakScanning } = useGarakScans();
  const [isFuzzing, setIsFuzzing] = useState(false);

  const handleCustomScan = async (data: {
    prompts: string[];
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
    customEndpoint?: any;
  }) => {
    try {
      const result = await createScan(data);
      setScanResult(result);
      
      if (data.prompts.length > 1) {
        toast.success("Batch scan completed. View results in the Results page.");
      } else {
        toast.success("Scan completed successfully");
      }
    } catch (error) {
      console.error('Scan creation failed:', error);
      toast.error('Failed to create scan: ' + (error as Error).message);
    }
  };

  const handleGarakScan = async (data: {
    name: string;
    model: string;
    prompts: string[];
    testSuites: string[];
    config?: Record<string, any>;
  }) => {
    try {
      await createGarakScan(data);
      toast.success("Garak scan initiated successfully");
      navigate("/llm-results");
    } catch (error) {
      console.error('Garak scan failed:', error);
      toast.error('Failed to create Garak scan: ' + (error as Error).message);
    }
  };

  const handleFuzzerScan = async (data: {
    prompt: string;
    numMutations: number;
    strategy: string;
    model: string;
  }) => {
    try {
      setIsFuzzing(true);
      const response = await supabase.functions.invoke('prompt-fuzzer', {
        body: data
      });

      if (response.error) throw response.error;

      setScanResult({
        prompt: data.prompt,
        model_response: JSON.stringify(response.data, null, 2)
      });
      
      toast.success("Prompt fuzzing completed successfully");
    } catch (error) {
      console.error('Fuzzing failed:', error);
      toast.error('Failed to run prompt fuzzer: ' + (error as Error).message);
    } finally {
      setIsFuzzing(false);
    }
  };

  const isBatchScan = scanResult?.results && Array.isArray(scanResult.results);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">LLM Scanner</h1>
        <p className="text-muted-foreground mb-8">
          Test your LLM models for potential security vulnerabilities and weaknesses
        </p>

        <Tabs defaultValue="custom" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="custom">Custom Scan</TabsTrigger>
            <TabsTrigger value="garak">Garak Scan</TabsTrigger>
            <TabsTrigger value="fuzzer">Prompt Fuzzer</TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <Card className="p-6">
              <ScanForm
                onSubmit={handleCustomScan}
                isScanning={isScanning}
              />
            </Card>

            {scanResult && !isBatchScan && (
              <div className="mt-6">
                <ScanResults result={scanResult} />
              </div>
            )}

            {isBatchScan && (
              <div className="mt-6 space-y-4">
                <p className="text-muted-foreground">
                  Batch scan completed successfully with {scanResult.results.length} results.
                </p>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => navigate("/llm-results")}
                >
                  View Batch Results <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="garak">
            <Card className="p-6">
              <GarakScanForm
                onSubmit={handleGarakScan}
                isScanning={isGarakScanning}
              />
            </Card>
          </TabsContent>

          <TabsContent value="fuzzer">
            <Card className="p-6">
              <PromptFuzzerForm
                onSubmit={handleFuzzerScan}
                isScanning={isFuzzing}
              />
            </Card>

            {scanResult && !isBatchScan && (
              <div className="mt-6">
                <ScanResults result={scanResult} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LLMScanner;