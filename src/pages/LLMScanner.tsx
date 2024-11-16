import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useLLMScans } from "@/hooks/useLLMScans";
import { useGarakScans } from "@/hooks/useGarakScans";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { GarakScanForm } from "@/components/llm-scanner/GarakScanForm";
import { PromptFuzzerForm } from "@/components/prompt-fuzzer/PromptFuzzerForm";
import { ScanResults } from "@/components/llm-scanner/ScanResults";
import { ModuleInfo } from "@/components/llm-scanner/ModuleInfo";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
    attackProvider: string;
    attackModel: string;
    targetProvider: string;
    targetModel: string;
    numAttempts: number;
    numThreads: number;
    attackTemperature: number;
    customBenchmark: string[];
    tests: string[];
  }) => {
    try {
      setIsFuzzing(true);
      const response = await supabase.functions.invoke('prompt-security-fuzzer', {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">LLM Scanner</h1>
        <p className="text-muted-foreground mb-8">
          Test your LLM models for potential security vulnerabilities and weaknesses
        </p>

        <Tabs defaultValue="custom" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="custom" className="flex items-center gap-1">
              Custom Scan
              <ModuleInfo type="custom" />
            </TabsTrigger>
            <TabsTrigger value="garak" className="flex items-center gap-1">
              Garak Scan
              <ModuleInfo type="garak" />
            </TabsTrigger>
            <TabsTrigger value="fuzzer" className="flex items-center gap-1">
              Prompt Fuzzer
              <ModuleInfo type="fuzzer" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <Card className="p-6">
              <ScanForm
                onSubmit={handleCustomScan}
                isScanning={isScanning}
              />
            </Card>

            {scanResult && (
              <ScanResults 
                result={scanResult} 
                isLoading={isScanning}
              />
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

            <ScanResults 
              result={scanResult} 
              isLoading={isFuzzing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LLMScanner;