import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateScript } from "@/components/fine-tuning/GenerateScript"
import { JobHistory } from "@/components/fine-tuning/JobHistory"
import { useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, History, Loader2 } from "lucide-react"

export const FineTuning = () => {
  const session = useSession()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
      }
    }
    checkAuth()
  }, [navigate])

  const handleScriptGenerated = async (script: string, model: string, parameters: any) => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to save your fine-tuning job"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('fine_tuning_jobs')
        .insert({
          user_id: session.user.id,
          model: model,
          status: 'script_generated',
          parameters: parameters,
          script_content: script
        })

      if (error) throw error

      toast({
        title: "Script saved successfully",
        description: "You can view it in the Job History tab"
      })
    } catch (error) {
      console.error('Error saving script:', error)
      toast({
        variant: "destructive",
        title: "Failed to save script",
        description: "Please try again"
      })
    }
  }

  // Show loading state while checking session
  if (session === undefined) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="container py-8 space-y-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
          <div className="relative p-6 md:p-8 rounded-lg glass-card">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Fine-Tuning
              </h1>
            </div>
            <p className="text-white/80 text-lg max-w-2xl">
              Fine-tune language models with your custom datasets and parameters. Monitor training progress and manage your fine-tuning jobs.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] p-1 bg-white/5 backdrop-blur-sm">
            <TabsTrigger value="generate" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Settings className="h-4 w-4" />
              Generate Script
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <History className="h-4 w-4" />
              Job History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <GenerateScript onScriptGenerated={handleScriptGenerated} />
          </TabsContent>

          <TabsContent value="history">
            <JobHistory />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  )
}

export default FineTuning