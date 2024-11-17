import { Progress } from "@/components/ui/progress";

interface Result {
  original: string;
  augmented?: string;
  error?: string;
}

interface ResultsProps {
  results: Result[];
  totalPrompts?: number;
  processedPrompts?: number;
}

const Results = ({ results, totalPrompts, processedPrompts }: ResultsProps) => {
  if (!results.length && !totalPrompts) return null;

  const progress = totalPrompts ? Math.round((processedPrompts || 0) / totalPrompts * 100) : 0;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">Results</h2>
      
      {totalPrompts && processedPrompts !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processing prompts...</span>
            <span>{processedPrompts.toLocaleString()} / {totalPrompts.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {results.map((result, index) => (
        <div key={index} className="p-4 rounded-lg border">
          <div className="mb-2">
            <h3 className="font-medium">Original Prompt:</h3>
            <p className="text-muted-foreground">{result.original}</p>
          </div>
          {result.augmented ? (
            <div>
              <h3 className="font-medium">Augmented Prompt:</h3>
              <p className="text-muted-foreground">{result.augmented}</p>
            </div>
          ) : (
            <p className="text-red-500">{result.error}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Results;