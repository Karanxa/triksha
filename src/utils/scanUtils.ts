export const getScanType = (results: any): "Manual Scan" | "Batch Scan" => {
  // Check if results has responses array which indicates a batch scan
  if (results?.responses && Array.isArray(results.responses)) {
    return "Batch Scan";
  }
  
  return "Manual Scan";
};