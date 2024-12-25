import { Database, History, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
        action={
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <CreateDataset />
              </DialogContent>
            </Dialog>
            <Link 
              to="/datasets/history" 
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <History className="w-4 h-4" />
              View History
            </Link>
          </div>
        }
      />
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
        <Tabs defaultValue="your-datasets" className="w-full p-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="your-datasets">Your Datasets</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          <TabsContent value="your-datasets">
            <DatasetsDashboard />
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