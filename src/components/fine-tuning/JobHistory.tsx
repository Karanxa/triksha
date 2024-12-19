import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { GeneratedScript } from "./GeneratedScript"

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
        No fine-tuning scripts generated yet
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{job.model}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Created on {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                Status: {job.status}
              </span>
            </div>
            {job.script_content && (
              <GeneratedScript script={job.script_content} />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};