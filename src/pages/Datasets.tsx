import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExistingDatasets } from "@/components/datasets/ExistingDatasets"
import { CreateDataset } from "@/components/datasets/CreateDataset"
import { DatasetsDashboard } from "@/components/datasets/DatasetsDashboard"

const Datasets = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Datasets</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="dashboard">My Datasets</TabsTrigger>
          <TabsTrigger value="existing">Public Datasets</TabsTrigger>
          <TabsTrigger value="create">Create Dataset</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DatasetsDashboard />
        </TabsContent>

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