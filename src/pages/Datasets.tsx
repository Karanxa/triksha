import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExistingDatasets } from "@/components/datasets/ExistingDatasets"
import { CreateDataset } from "@/components/datasets/CreateDataset"
import { DatasetsDashboard } from "@/components/datasets/DatasetsDashboard"
import { Database, FileSpreadsheet, Plus } from "lucide-react"

const Datasets = () => {
  return (
    <div className="min-h-screen bg-dataset-pattern dark">
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Datasets
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Manage and explore datasets for LLM testing and fine-tuning. Create, analyze, and share datasets to improve your models.
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px] p-1 bg-white/5 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Database className="h-4 w-4" />
              My Datasets
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <FileSpreadsheet className="h-4 w-4" />
              Public Datasets
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Plus className="h-4 w-4" />
              Create Dataset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <DatasetsDashboard />
          </TabsContent>

          <TabsContent value="existing" className="animate-fade-in">
            <ExistingDatasets />
          </TabsContent>

          <TabsContent value="create" className="animate-fade-in">
            <CreateDataset />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Datasets;