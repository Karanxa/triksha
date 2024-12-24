import { Database, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { DatasetsDashboard } from "@/components/datasets/DatasetsDashboard";

const Datasets = () => {
  return (
    <div className="container py-4 md:py-8">
      <PageHeader
        icon={Database}
        title="Datasets"
        description="Manage and analyze your datasets for LLM security testing and fine-tuning."
        action={
          <Link 
            to="/datasets/history" 
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <History className="w-4 h-4" />
            View History
          </Link>
        }
      />
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
        <DatasetsDashboard />
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default Datasets;