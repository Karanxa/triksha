import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Result {
  original: string;
  augmented?: string;
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

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
            <div className="col-span-4 font-medium">Original Prompt</div>
            <div className="col-span-4 font-medium">Model Response</div>
            <div className="col-span-3 font-medium">Status</div>
          </div>

          {/* Results */}
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/30">
                <div className="col-span-1 text-muted-foreground">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="col-span-4">
                  <div className="text-sm break-words">
                    {truncateText(result.original)}
                  </div>
                </div>
                <div className="col-span-4">
                  {result.response ? (
                    <div className="text-sm break-words">
                      {truncateText(result.response)}
                    </div>
                  ) : (
                    <div className="italic text-muted-foreground text-sm">
                      Awaiting response...
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  {result.error ? (
                    <span className="text-sm text-destructive">{result.error}</span>
                  ) : result.response ? (
                    <span className="text-sm text-green-500">Complete</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Processing</span>
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