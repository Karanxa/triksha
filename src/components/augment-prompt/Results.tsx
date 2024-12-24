import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Result {
  original: string;
  augmented: string;
  response?: string;
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

      <ScrollArea className="h-[500px] w-full rounded-md border">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b">
            <div className="col-span-1 font-medium">#</div>
            <div className="col-span-3 font-medium">Original Prompt</div>
            <div className="col-span-3 font-medium">Augmented Prompt</div>
            <div className="col-span-3 font-medium">Model Response</div>
            <div className="col-span-2 font-medium">Status</div>
          </div>

          {/* Results */}
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/30">
                <div className="col-span-1 text-muted-foreground">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="col-span-3 text-sm">
                  <div className="line-clamp-3">{result.original}</div>
                </div>
                <div className="col-span-3 text-sm">
                  {result.augmented ? (
                    <div className="line-clamp-3">{result.augmented}</div>
                  ) : (
                    <div className="italic text-muted-foreground">Processing...</div>
                  )}
                </div>
                <div className="col-span-3 text-sm">
                  {result.response ? (
                    <div className="line-clamp-3">{result.response}</div>
                  ) : (
                    <div className="italic text-muted-foreground">Awaiting response...</div>
                  )}
                </div>
                <div className="col-span-2">
                  {result.error ? (
                    <span className="text-sm text-destructive">{result.error}</span>
                  ) : result.response ? (
                    <span className="text-sm text-green-500">Complete</span>
                  ) : result.augmented ? (
                    <span className="text-sm text-blue-500">Processing</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Results;