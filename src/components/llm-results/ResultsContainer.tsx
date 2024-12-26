import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "./ResultsTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultsFilters } from "./ResultsFilters";
import { LLMScan, GeraideScan } from "./types";

interface ResultsContainerProps {
  scans?: LLMScan[];
  geraidScans?: GeraideScan[];
  isScansLoading?: boolean;
  isGeraideLoading?: boolean;
  scansError?: Error | null;
  geraideError?: Error | null;
  filteredScans?: LLMScan[];
  filteredContextualScans?: GeraideScan[];
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
  contextualProps
}: ResultsContainerProps) => {
  if (isScansLoading || isGeraideLoading) return <LoadingState />;
  if (scansError || geraideError) return <ErrorState error={scansError || geraideError} />;
  if (!scans?.length && !geraidScans?.length) return <EmptyState />;

  return (
    <div className="space-y-6">
      <ResultsFilters {...searchProps} />
      <ResultsTable scans={filteredScans || []} />
    </div>
  );
};