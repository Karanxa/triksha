import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ContextualEngine } from "@/components/llm-scanner/contextual-engine/ContextualEngine";
import { Link } from "react-router-dom";
import { Shield, History } from "lucide-react";

const LLMScanner = () => {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
        <div className="relative p-6 md:p-8 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">LLM Scanner</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Test LLM models for security vulnerabilities and analyze their responses with our advanced scanning tools.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Link 
              to="/llm-results" 
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <History className="w-4 h-4" />
              View Scan History
            </Link>
          </div>
        </div>
      </div>
      
      <Card className="w-full max-w-3xl mx-auto border border-border/50 shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger 
                value="basic"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Custom Scan
              </TabsTrigger>
              <TabsTrigger 
                value="contextual"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Contextual Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <ScanForm />
            </TabsContent>

            <TabsContent value="contextual" className="mt-6">
              <ContextualEngine />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default LLMScanner;