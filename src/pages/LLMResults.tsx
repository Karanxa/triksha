import { ScanResults } from "@/components/llm-results/ScanResults";

const LLMResults = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Results</h1>
      <p className="text-muted-foreground mb-8">View and analyze the results of your LLM security scans.</p>
      <ScanResults />
    </div>
  );
};

export default LLMResults;