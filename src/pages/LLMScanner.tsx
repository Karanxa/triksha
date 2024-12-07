import { Card, CardContent } from "@/components/ui/card";
import { ScanTabs } from "@/components/llm-scanner/ScanTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ContextualEngine } from "@/components/llm-scanner/contextual-engine/ContextualEngine";
import { Link } from "react-router-dom";

const LLMScanner = () => {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-bold">Scans</h1>
        <Link 
          to="/llm-results" 
          className="text-sm text-primary hover:underline"
        >
          View Results →
        </Link>
      </div>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Test LLM models for security vulnerabilities and analyze their responses.
      </p>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Custom Scan</TabsTrigger>
              <TabsTrigger value="contextual">Contextual Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <ScanForm />
            </TabsContent>

            <TabsContent value="contextual">
              <ContextualEngine />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LLMScanner;