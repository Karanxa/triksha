import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ResultsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Scan Type</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Prompt</TableHead>
        <TableHead>Response</TableHead>
        <TableHead>Raw JSON</TableHead>
        <TableHead>Category & Risk</TableHead>
        <TableHead>Vulnerability Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};