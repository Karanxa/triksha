import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateScript } from "@/components/fine-tuning/GenerateScript"
import { JobHistory } from "@/components/fine-tuning/JobHistory"
import { useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { GoogleLogin } from "@/components/fine-tuning/GoogleLogin"

export const FineTuning = () => {
  const session = useSession()
  const { toast } = useToast()
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(false)

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
          <GenerateScript isGoogleAuthed={isGoogleAuthed} />
        </TabsContent>

        <TabsContent value="history">
          <JobHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FineTuning