import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Code } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GeneratedScript } from "./GeneratedScript"

export const JobHistory = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['fine-tuning-jobs'],
    queryFn: async () => {
      console.log('Fetching fine-tuning jobs...')
      const { data, error } = await supabase
        .from('fine_tuning_jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }

      console.log('Fetched jobs:', data)
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!jobs?.length) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        No fine-tuning jobs found
      </Card>
    )
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
                  Status: {job.status}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
                {job.script_content && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        View Script
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Generated Script</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                        <GeneratedScript script={job.script_content} />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            {job.parameters && (
              <div className="text-sm text-muted-foreground">
                <p>Parameters:</p>
                <pre className="mt-1 text-xs bg-secondary/50 p-2 rounded">
                  {JSON.stringify(job.parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}