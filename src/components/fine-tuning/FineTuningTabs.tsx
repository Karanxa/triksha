import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateScript } from "./GenerateScript"
import { JobHistory } from "./JobHistory"
import { GoogleLogin } from "./GoogleLogin"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import { supabase } from "@/integrations/supabase/client"

export const FineTuningTabs = () => {
  const { toast } = useToast()
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(false)
  const session = useSession()

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

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fine-Tuning</h1>
        <GoogleLogin 
          onSuccess={() => setIsGoogleAuthed(true)}
          onError={() => {
            toast({
              variant: "destructive",
              title: "Google authentication failed",
              description: "Please try again"
            })
          }}
        />
      </div>
      
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="generate">Generate Script</TabsTrigger>
          <TabsTrigger value="history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateScript 
            isGoogleAuthed={isGoogleAuthed} 
            onScriptGenerated={handleScriptGenerated}
          />
        </TabsContent>

        <TabsContent value="history">
          <JobHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}