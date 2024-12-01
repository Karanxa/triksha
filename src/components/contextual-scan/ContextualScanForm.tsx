import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ProviderSelect } from "@/components/augment-prompt/ProviderSelect";
import { DatasetSelector } from "@/components/llm-scanner/DatasetSelector";
import { CSVUpload } from "@/components/llm-scanner/CSVUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWindow } from "./ChatWindow";
import { supabase } from "@/integrations/supabase/client";

export function ContextualScanForm() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const handleStartScan = async () => {
    if (!provider || prompts.length === 0) {
      toast.error("Please select a provider and upload prompts");
      return;
    }

    try {
      setIsScanning(true);
      
      // Create new contextual scan
      const { data: scan, error: scanError } = await supabase
        .from('contextual_scans')
        .insert({
          provider,
          model: provider.split('-')[1],
          messages: []
        })
        .select()
        .single();

      if (scanError) throw scanError;
      
      setScanId(scan.id);

      // Start the fingerprinting phase
      const { data, error } = await supabase.functions.invoke('contextual-scan', {
        body: { 
          scanId: scan.id,
          provider,
          prompts
        }
      });

      if (error) throw error;

      toast.success("Scan completed successfully");
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStop = async () => {
    if (!scanId) return;
    
    try {
      await supabase
        .from('contextual_scans')
        .update({ status: 'stopped' })
        .eq('id', scanId);
      
      toast.success("Scan stopped");
      setIsScanning(false);
    } catch (error: any) {
      toast.error("Failed to stop scan");
    }
  };

  return (
    <div className="space-y-8">
      <ProviderSelect 
        value={provider} 
        onValueChange={setProvider}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="select">Select Dataset</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <CSVUpload onPromptsExtracted={setPrompts} />
        </TabsContent>
        
        <TabsContent value="select">
          <DatasetSelector onDatasetSelected={setPrompts} />
        </TabsContent>
      </Tabs>

      {prompts.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {prompts.length} prompts loaded
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={handleStartScan}
          disabled={isScanning || !provider || prompts.length === 0}
          className="w-full"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Start Scan"
          )}
        </Button>
        
        {isScanning && (
          <Button
            variant="destructive"
            onClick={handleStop}
            className="w-full"
          >
            Stop Scan
          </Button>
        )}
      </div>

      {scanId && (
        <Card className="mt-8">
          <ScrollArea className="h-[500px]">
            <ChatWindow scanId={scanId} />
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}