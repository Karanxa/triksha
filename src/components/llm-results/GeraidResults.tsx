import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { ChatMessages } from "../llm-scanner/chat/ChatMessages";
import { toast } from "sonner";

interface GeraidScan {
  id: string;
  provider: string;
  model: string;
  messages: any[];
  is_vulnerable: boolean | null;
  created_at: string;
}

export const GeraidResults = () => {
  const [selectedScan, setSelectedScan] = useState<GeraidScan | null>(null);

  const { data: scans, isLoading, error } = useQuery({
    queryKey: ['geraide-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load Geraide scans");
        throw error;
      }

      return data as GeraidScan[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">
        Failed to load scan results
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No Geraide scan results found. Try running a scan first.
      </div>
    );
  }

  const dateOnly = (date: string) => new Date(date).toLocaleDateString();
  const fullDateTime = (date: string) => new Date(date).toLocaleString();

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {scans.map((scan) => (
          <Card key={scan.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{scan.model}</Badge>
                    <Badge variant="outline">{scan.provider}</Badge>
                    <Badge 
                      variant={scan.is_vulnerable ? "destructive" : "secondary"}
                    >
                      {scan.is_vulnerable ? "Vulnerable" : "Secure"}
                    </Badge>
                  </div>
                  <div 
                    className="text-sm text-muted-foreground cursor-help"
                    title={fullDateTime(scan.created_at)}
                  >
                    {dateOnly(scan.created_at)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScan(scan)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <ScrollArea className="h-full max-h-[70vh]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedScan?.model}</Badge>
                <Badge variant="outline">{selectedScan?.provider}</Badge>
                <Badge 
                  variant={selectedScan?.is_vulnerable ? "destructive" : "secondary"}
                >
                  {selectedScan?.is_vulnerable ? "Vulnerable" : "Secure"}
                </Badge>
              </div>
              {selectedScan?.messages && (
                <ChatMessages 
                  messages={selectedScan.messages} 
                  isLoading={false} 
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};