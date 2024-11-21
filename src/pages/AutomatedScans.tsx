import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomatedScanForm } from "@/components/automated-scan/AutomatedScanForm";
import { AutomatedScanList } from "@/components/automated-scan/AutomatedScanList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AutomatedScans() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['scheduled-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Automated Scans</h1>
      <p className="text-muted-foreground mb-8">Schedule and manage automated security scans for your LLM applications.</p>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="create">Create Scan</TabsTrigger>
          <TabsTrigger value="list">Scheduled Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Automated Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <AutomatedScanForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AutomatedScanList scans={scans || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}