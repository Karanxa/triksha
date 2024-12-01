import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Play, Pause } from "lucide-react";

interface AutomatedScan {
  id: string;
  name: string;
  description: string | null;
  schedule: string;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
}

interface AutomatedScanListProps {
  scans: AutomatedScan[];
}

export const AutomatedScanList = ({ scans }: AutomatedScanListProps) => {
  const toggleScanStatus = async (scanId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_llm_scans')
        .update({ is_active: !currentStatus })
        .eq('id', scanId);

      if (error) throw error;
      
      toast.success(`Scan ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error: any) {
      toast.error("Failed to update scan status: " + error.message);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString();
  };

  const getScheduleLabel = (schedule: string) => {
    const labels: Record<string, string> = {
      hourly: 'Every Hour',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    };
    return labels[schedule] || schedule;
  };

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No automated scans configured yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {scans.map((scan) => (
          <Card key={scan.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{scan.name}</CardTitle>
                  {scan.description && (
                    <p className="text-sm text-muted-foreground">{scan.description}</p>
                  )}
                </div>
                <Switch
                  checked={scan.is_active}
                  onCheckedChange={() => toggleScanStatus(scan.id, scan.is_active)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getScheduleLabel(scan.schedule)}
                  </Badge>
                  <Badge variant={scan.is_active ? "default" : "secondary"}>
                    {scan.is_active ? (
                      <Play className="h-3 w-3 mr-1" />
                    ) : (
                      <Pause className="h-3 w-3 mr-1" />
                    )}
                    {scan.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Last Run
                    </p>
                    <p>{formatDate(scan.last_run)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Next Run
                    </p>
                    <p>{formatDate(scan.next_run)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};