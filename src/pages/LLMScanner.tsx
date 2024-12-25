import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ContextualEngine } from "@/components/llm-scanner/contextual-engine/ContextualEngine";
import { Link } from "react-router-dom";
import { Shield, History } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LLMScanner = () => {
  useEffect(() => {
    const checkApiKeys = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      if (!profile?.api_keys) {
        toast.info("Please configure your API keys in the Settings to use all features", {
          action: {
            label: "Go to Settings",
            onClick: () => window.location.href = "/settings"
          },
          duration: 5000
        });
      }
    };

    checkApiKeys();
  }, []);

  return (
    <div className="container py-4 md:py-8">
      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
        <div className="relative p-6 md:p-8 rounded-lg">
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Secure GenAI with <span className="text-[#9b87f5]">Triksha</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Your end to end LLM red teaming platform
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
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
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger 
                value="basic"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Static Scan
              </TabsTrigger>
              <TabsTrigger 
                value="contextual"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Contextual Scan
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