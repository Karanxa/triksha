import { Card, CardContent } from "@/components/ui/card";
import { ScanTabs } from "@/components/llm-scanner/ScanTabs";

const LLMScanner = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">LLM Scanner</h1>
      <Card>
        <CardContent className="pt-6">
          <ScanTabs />
        </CardContent>
      </Card>
    </div>
  );
};

export default LLMScanner;