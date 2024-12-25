import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTable } from "./ResultsTable";
import { ContextualScanResults } from "./ContextualScanResults";
import { ResultsFilters } from "./ResultsFilters";
import { ContextualFilters } from "./ContextualFilters";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { LLMScan, GeraideScan } from "./types";

interface ResultsContainerProps {
  scans: LLMScan[] | undefined;
  geraidScans: GeraideScan[] | undefined;
  isScansLoading: boolean;
  isGeraideLoading: boolean;
  scansError: Error | null;
  geraideError: Error | null;
  filteredScans: LLMScan[] | undefined;
  filteredContextualScans: GeraideScan[] | undefined;
  searchProps: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    selectedScanType: string;
    setSelectedScanType: (value: string) => void;
    vulnerabilityStatus: string;
    setVulnerabilityStatus: (value: string) => void;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
  };
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
  contextualProps,
}: ResultsContainerProps) => {
  const renderContent = (type: 'scans' | 'contextual') => {
    const isLoading = type === 'scans' ? isScansLoading : isGeraideLoading;
    const error = type === 'scans' ? scansError : geraideError;
    const data = type === 'scans' ? filteredScans : filteredContextualScans;

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!data || data.length === 0) {
      return <EmptyState />;
    }

    if (type === 'scans') {
      return <ResultsTable scans={data as LLMScan[]} />;
    }

    return <ContextualScanResults scans={data as GeraideScan[]} />;
  };

  return (
    <Card className="glass-card overflow-hidden border-0">
      <Tabs defaultValue="scans" className="w-full">
        <TabsList className="w-full grid grid-cols-2 gap-4 bg-transparent p-1">
          <TabsTrigger 
            value="scans" 
            className="w-full bg-neutral-light hover:bg-neutral-gray/10 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors"
          >
            Custom Scans
          </TabsTrigger>
          <TabsTrigger 
            value="contextual" 
            className="w-full bg-neutral-light hover:bg-neutral-gray/10 data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-colors"
          >
            Contextual Analysis
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="scans" className="mt-0 animate-fade-in space-y-6">
            <ResultsFilters {...searchProps} />
            {renderContent('scans')}
          </TabsContent>

          <TabsContent value="contextual" className="mt-0 animate-fade-in space-y-6">
            <ContextualFilters
              searchQuery={contextualProps.contextSearchQuery}
              setSearchQuery={contextualProps.setContextSearchQuery}
              selectedModel={contextualProps.contextModel}
              setSelectedModel={contextualProps.setContextModel}
              vulnerabilityStatus={contextualProps.contextVulnerabilityStatus}
              setVulnerabilityStatus={contextualProps.setContextVulnerabilityStatus}
            />
            {renderContent('contextual')}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};