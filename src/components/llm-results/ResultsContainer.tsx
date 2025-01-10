import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultsFilters, ResultsFiltersProps } from "./ResultsFilters";
import { ResultsTable } from "./ResultsTable";
import { ContextualFilters } from "./ContextualFilters";
import { ContextualScanResults } from "./ContextualScanResults";
import { LLMScan, GeraideScan } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultsContainerProps {
  scans?: LLMScan[];
  geraidScans?: GeraideScan[];
  isScansLoading?: boolean;
  isGeraideLoading?: boolean;
  scansError?: Error | null;
  geraideError?: Error | null;
  filteredScans?: LLMScan[];
  filteredContextualScans?: GeraideScan[];
  searchProps: ResultsFiltersProps;
  contextualProps: {
    contextSearchQuery: string;
    setContextSearchQuery: (value: string) => void;
    contextModel: string;
    setContextModel: (value: string) => void;
    contextVulnerabilityStatus: string;
    setContextVulnerabilityStatus: (value: string) => void;
  };
}

export const ResultsContainer = ({
  scans,
  geraidScans,
  isScansLoading,
  isGeraideLoading,
  scansError,
  geraideError,
  filteredScans,
  filteredContextualScans,
  searchProps,
  contextualProps
}: ResultsContainerProps) => {
  if (isScansLoading || isGeraideLoading) return <LoadingState />;
  if (scansError || geraideError) return <ErrorState error={scansError || geraideError} />;
  if (!scans?.length && !geraidScans?.length) return <EmptyState />;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="regular" className="flex items-center gap-2">
            Regular Scans
            <span className="text-xs text-muted-foreground">
              ({filteredScans?.length || 0})
            </span>
          </TabsTrigger>
          <TabsTrigger value="contextual" className="flex items-center gap-2">
            Contextual Scans
            <span className="text-xs text-muted-foreground">
              ({filteredContextualScans?.length || 0})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-6">
          <ResultsFilters {...searchProps} />
          <div className="rounded-lg border bg-card">
            <ResultsTable scans={filteredScans || []} />
          </div>
        </TabsContent>

        <TabsContent value="contextual" className="space-y-6">
          <ContextualFilters
            searchQuery={contextualProps.contextSearchQuery}
            setSearchQuery={contextualProps.setContextSearchQuery}
            selectedModel={contextualProps.contextModel}
            setSelectedModel={contextualProps.setContextModel}
            vulnerabilityStatus={contextualProps.contextVulnerabilityStatus}
            setVulnerabilityStatus={contextualProps.setContextVulnerabilityStatus}
          />
          {filteredContextualScans && filteredContextualScans.length > 0 ? (
            <ContextualScanResults scans={filteredContextualScans} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No contextual scan results found
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};