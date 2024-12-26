import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultsFilters, ResultsFiltersProps } from "./ResultsFilters";
import { ResultsTable } from "./ResultsTable";
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
      <ResultsFilters {...searchProps} />
      <ResultsTable scans={filteredScans || []} />
    </div>
  );
};