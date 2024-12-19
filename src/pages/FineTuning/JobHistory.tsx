import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const JobHistory = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['fine-tuning-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fine_tuning_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!jobs?.length) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        No fine-tuning jobs found
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{job.model}</h3>
              <span className="text-sm text-muted-foreground">
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {job.status}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};