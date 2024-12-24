import { Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { FineTuning as FineTuningComponent } from "@/components/fine-tuning/FineTuning";

const FineTuning = () => {
  return (
    <div className="container py-4 md:py-8">
      <PageHeader
        icon={Dumbbell}
        title="Fine-Tuning"
        description="Fine-tune language models with your custom datasets to improve their security and performance."
      />
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
        <FineTuningComponent />
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default FineTuning;