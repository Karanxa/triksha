import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExistingDatasets } from "@/components/datasets/ExistingDatasets"
import { CreateDataset } from "@/components/datasets/CreateDataset"
import { DatasetsDashboard } from "@/components/datasets/DatasetsDashboard"
import { Database, FileSpreadsheet, Plus } from "lucide-react"

const Datasets = () => {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="container py-8 space-y-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
          <div className="relative p-6 md:p-8 rounded-lg glass-card">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Datasets
              </h1>
            </div>
            <p className="text-white/80 text-lg max-w-2xl">
              Manage and explore datasets for LLM testing and fine-tuning. Create, analyze, and share datasets to improve your models.
            </p>
          </div>
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
      
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  )
}

export default Datasets