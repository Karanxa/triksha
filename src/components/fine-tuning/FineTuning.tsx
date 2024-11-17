import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateScript } from "./GenerateScript"
import { JobHistory } from "./JobHistory"

export const FineTuning = () => {
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Fine-Tuning</h1>
      
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="generate">Generate Script</TabsTrigger>
          <TabsTrigger value="history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateScript />
        </TabsContent>

        <TabsContent value="history">
          <JobHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FineTuning