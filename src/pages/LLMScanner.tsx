import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ContextualEngine } from "@/components/llm-scanner/contextual-engine/ContextualEngine";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Shield, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LLMScanner = () => {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
          LLM Security Scanner
        </h1>
        <Link 
          to="/llm-results" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View Results <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Custom Scanning</h3>
                <p className="text-sm text-muted-foreground">
                  Test models with custom prompts and analyze their responses for vulnerabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Contextual Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into model behavior and identify potential security weaknesses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 hover:bg-card/80 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Batch Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Run multiple tests in parallel with automated analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security First</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Our platform helps you identify and mitigate potential security risks in your LLM implementations. 
          Choose between custom scans for specific tests or contextual analysis for deeper insights.
        </AlertDescription>
      </Alert>
      
      {/* Main Content */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="data-[state=active]:bg-primary">
                Custom Scan
              </TabsTrigger>
              <TabsTrigger value="contextual" className="data-[state=active]:bg-primary">
                Contextual Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">Custom Security Scan</h2>
                <p className="text-sm text-muted-foreground">
                  Test your models against specific security scenarios. Upload multiple prompts 
                  or create individual test cases to identify vulnerabilities.
                </p>
              </div>
              <ScanForm />
            </TabsContent>

            <TabsContent value="contextual">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">Contextual Security Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  Perform in-depth analysis of model behavior and security boundaries through 
                  interactive testing and response analysis.
                </p>
              </div>
              <ContextualEngine />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LLMScanner;