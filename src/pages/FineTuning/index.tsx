import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateFineTuningJob } from "./CreateFineTuningJob"
import { JobHistory } from "./JobHistory"
import { useSession } from "@supabase/auth-helpers-react"
import { Loader2 } from "lucide-react"

const FineTuning = () => {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fine-Tuning</h1>
        <p className="text-muted-foreground">
          Fine-tune language models with your custom datasets and parameters.
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="create">Create Job</TabsTrigger>
            <TabsTrigger value="history">Job History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <CreateFineTuningJob onScriptGenerated={() => {}} />
          </TabsContent>

          <TabsContent value="history">
            <JobHistory />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default FineTuning