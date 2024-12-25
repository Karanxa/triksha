import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import { DatasetsDashboard } from "@/components/datasets/DatasetsDashboard";
import { ExistingDatasets } from "@/components/datasets/ExistingDatasets";
import { CreateDataset } from "@/components/datasets/CreateDataset";

const Datasets = () => {
  return (
    <div className="container py-4 md:py-8">
      <PageHeader
        icon={Database}
        title="Datasets"
        description="Manage and analyze your datasets for LLM security testing and fine-tuning."
      />
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
        <Tabs defaultValue="your-datasets" className="w-full p-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="your-datasets">Your Datasets</TabsTrigger>
            <TabsTrigger value="create">Create Dataset</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          <TabsContent value="your-datasets">
            <DatasetsDashboard />
          </TabsContent>

          <TabsContent value="create">
            <CreateDataset />
          </TabsContent>

          <TabsContent value="explore">
            <ExistingDatasets />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default Datasets;