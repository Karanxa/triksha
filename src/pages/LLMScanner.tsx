import { Card, CardContent } from "@/components/ui/card";
import { ScanTabs } from "@/components/llm-scanner/ScanTabs";

const LLMScanner = () => {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Scans</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Test LLM models for security vulnerabilities and analyze their responses.
      </p>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-4 md:pt-6">
          <ScanTabs initialTab="basic" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LLMScanner;