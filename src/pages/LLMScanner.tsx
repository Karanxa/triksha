import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useLLMScans } from "@/hooks/useLLMScans";
import { useGarakScans } from "@/hooks/useGarakScans";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { GarakScanForm } from "@/components/llm-scanner/GarakScanForm";
import { ScanResults } from "@/components/llm-scanner/ScanResults";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LLMScanner = () => {
  const navigate = useNavigate();
  const [isBatchScan, setIsBatchScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { createScan, isScanning } = useLLMScans();
  const { createScan: createGarakScan, isScanning: isGarakScanning } = useGarakScans();

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
      setIsBatchScan(data.prompts.length > 1);
      
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">LLM Scanner</h1>
        <p className="text-muted-foreground mb-8">
          Test your LLM models for potential security vulnerabilities and weaknesses
        </p>

        <Tabs defaultValue="custom" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="custom">Custom Scan</TabsTrigger>
            <TabsTrigger value="garak">Garak Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <Card className="p-6">
              <ScanForm
                onSubmit={handleCustomScan}
                isScanning={isScanning}
              />
            </Card>

            {scanResult && !isBatchScan && (
              <ScanResults result={scanResult} />
            )}

            {isBatchScan && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/llm-results")}
              >
                View Batch Scan Results <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
        </Tabs>
      </div>
    </div>
  );
};

export default LLMScanner;