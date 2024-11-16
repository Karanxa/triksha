import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExistingDatasets } from "@/components/datasets/ExistingDatasets"
import { CreateDataset } from "@/components/datasets/CreateDataset"

const Datasets = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Datasets</h1>
      
      <Tabs defaultValue="existing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="existing">Existing Datasets</TabsTrigger>
          <TabsTrigger value="create">Create Your Own</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">
          <ExistingDatasets />
        </TabsContent>

        <TabsContent value="create">
          <CreateDataset />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Datasets