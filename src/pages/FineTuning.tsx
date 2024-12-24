import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateFineTuningJob } from "./FineTuning/CreateFineTuningJob"
import { JobHistory } from "./FineTuning/JobHistory"
import { useSession } from "@supabase/auth-helpers-react"
import { Settings, History, Loader2 } from "lucide-react"

export const FineTuning = () => {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8 content-container">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
          <div className="relative p-8 rounded-lg glass-card">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Fine-Tuning
              </h1>
            </div>
            <p className="text-foreground/80 text-lg max-w-2xl leading-relaxed">
              Fine-tune language models with your custom datasets and parameters. Monitor training progress and manage your fine-tuning jobs.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] p-1 bg-white/5 backdrop-blur-sm">
            <TabsTrigger 
              value="generate" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Generate Script
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-white/10"
            >
              <History className="h-4 w-4" />
              Job History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="animate-fade-in">
            <CreateFineTuningJob />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <JobHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default FineTuning