export const getScanType = (results: { prompt: string } | null): "Manual Scan" | "Batch Scan" => {
  if (!results) return "Manual Scan";
  return "Manual Scan";
};