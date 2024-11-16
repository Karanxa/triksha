export const getScanType = (results: { prompt: string; model_response: string } | null, isBatchScan?: boolean): "Manual Scan" | "Batch Scan" => {
  if (isBatchScan) return "Batch Scan";
  return "Manual Scan";
};