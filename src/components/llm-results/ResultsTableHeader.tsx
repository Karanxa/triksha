import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ResultsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Scan Type</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Model</TableHead>
        <TableHead className="border-l">Prompt & Response</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};