import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Maximize2 } from "lucide-react";

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
  const [selectedContent, setSelectedContent] = useState<{title: string, content: string} | null>(null);
  
  if (!results.length && !totalPrompts) return null;

  const progress = totalPrompts ? Math.round((processedPrompts || 0) / totalPrompts * 100) : 0;

  const formatResponse = (response: any): string => {
    if (typeof response === 'string') return response;
    try {
      // If it's an object (like the GPT response structure), try to extract the actual message
      if (typeof response === 'object') {
        if (response.choices?.[0]?.message?.content) {
          return response.choices[0].message.content;
        }
        // Fallback to stringifying the entire response
        return JSON.stringify(response, null, 2);
      }
      return String(response);
    } catch (e) {
      console.error('Error formatting response:', e);
      return String(response);
    }
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
            <div className="col-span-6 font-medium">Model Response</div>
            <div className="col-span-1 font-medium">Status</div>
          </div>

          {/* Results */}
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/30">
                <div className="col-span-1 text-muted-foreground">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="col-span-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm break-words line-clamp-3">
                      {result.original}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => setSelectedContent({
                        title: "Original Prompt",
                        content: result.original
                      })}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="col-span-6">
                  {result.response ? (
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm break-words line-clamp-3">
                        {formatResponse(result.response)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => setSelectedContent({
                          title: "Model Response",
                          content: typeof result.response === 'string' 
                            ? result.response 
                            : JSON.stringify(result.response, null, 2)
                        })}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="italic text-muted-foreground text-sm">
                      Awaiting response...
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  {result.error ? (
                    <span className="text-sm text-destructive">Error</span>
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

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogTitle>{selectedContent?.title}</DialogTitle>
          <ScrollArea className="h-full max-h-[70vh]">
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
              {selectedContent?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;