import { ResultsFilters } from "./ResultsFilters";
import { ResultsTable } from "./ResultsTable";
import { LLMScan } from "./types";
import { useState } from "react";

interface CustomScanResultsProps {
  scans: LLMScan[];
}

export const CustomScanResults = ({ scans }: CustomScanResultsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScanType, setSelectedScanType] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

  return (
    <div className="space-y-6">
      <ResultsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedScanType={selectedScanType}
        setSelectedScanType={setSelectedScanType}
        vulnerabilityStatus={vulnerabilityStatus}
        setVulnerabilityStatus={setVulnerabilityStatus}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      
      <ResultsTable scans={scans} />
    </div>
  );
};