import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateScript } from "./GenerateScript"
import { JobHistory } from "./JobHistory"
import { useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

export const FineTuning = () => {
  const session = useSession()
  const { toast } = useToast()

  const handleScriptGenerated = async (script: string, model: string, parameters: any) => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to save your fine-tuning job"
      })
      return
    }

    // We'll just show a success message here since GenerateScript.tsx handles the database insertion
    toast({
      title: "Script generated successfully",
      description: "You can view it in the Job History tab"
    })
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fine-Tuning</h1>
      </div>
      
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="generate">Generate Script</TabsTrigger>
          <TabsTrigger value="history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateScript onScriptGenerated={handleScriptGenerated} />
        </TabsContent>

        <TabsContent value="history">
          <JobHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FineTuning