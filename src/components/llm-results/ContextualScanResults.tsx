import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MessageCircle, ShieldAlert } from "lucide-react";
import { GeraideScan } from "./types";
import { ModelInteraction } from "../datasets/analysis/ModelInteraction";
import { Badge } from "../ui/badge";

interface GeraideResultsProps {
  scans: GeraideScan[];
}

export function ContextualScanResults({ scans }: GeraideResultsProps) {
  const [selectedScan, setSelectedScan] = useState<GeraideScan | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-1">
      {scans.map((scan) => (
        <Card 
          key={scan.id} 
          className="glass-card overflow-hidden border-0 transition-all hover:bg-accent/10"
        >
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Model details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm font-medium">
                    {scan.model}
                  </Badge>
                  <Badge 
                    variant={scan.is_vulnerable ? "destructive" : "secondary"}
                    className="text-sm"
                  >
                    {scan.is_vulnerable ? "Vulnerable" : "Secure"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(scan.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Provider: {scan.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{scan.messages.length} Messages</span>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedScan(scan)}
                  className="w-full md:w-auto"
                >
                  View Conversation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <ScrollArea className="h-full max-h-[70vh]">
            {selectedScan && (
              <ModelInteraction 
                messages={selectedScan.messages} 
                isLoading={false}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}