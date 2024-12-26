import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/llm-scanner/ScanForm";
import { ContextualEngine } from "@/components/llm-scanner/contextual-engine/ContextualEngine";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Shield } from "lucide-react";

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
    <div className="container py-4 md:py-8 space-y-6">
      <PageHeader
        icon={Shield}
        title="LLM Scanner"
        description="Test your prompts for vulnerabilities and analyze model responses"
      />
      
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