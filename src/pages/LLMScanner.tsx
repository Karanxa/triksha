import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLLMScans } from "@/hooks/useLLMScans";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ScanResults } from "@/components/llm-scanner/ScanResults";

const LLMScanner = () => {
  const navigate = useNavigate();
  const [isBatchScan, setIsBatchScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const { createScan, isScanning } = useLLMScans();

  const handleSubmit = async (data: {
    prompts: string[];
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
  }) => {
    try {
      const result = await createScan(data);
      
      if (data.prompts.length === 1) {
        setScanResult(result);
        toast.success("Scan completed successfully");
      } else {
        setIsBatchScan(true);
        toast.success("Batch scan initiated successfully");
        navigate("/llm-results");
      }
    } catch (error) {
      toast.error("Failed to create scan: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">LLM Scanner</h1>
        
        <ScanForm
          onSubmit={handleSubmit}
          isScanning={isScanning}
        />

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
      </div>
    </div>
  );
};

export default LLMScanner;