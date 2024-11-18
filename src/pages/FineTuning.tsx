import { FineTuningTabs } from "@/components/fine-tuning/FineTuningTabs"

const FineTuning = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Fine Tuning</h1>
      <p className="text-muted-foreground mb-8">Create and manage fine-tuning jobs to customize LLM models for your needs.</p>
      <FineTuningTabs />
    </div>
  );
};

export default FineTuning;