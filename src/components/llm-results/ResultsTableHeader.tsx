import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ResultsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Scan Type</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Model</TableHead>
        <TableHead className="border-l">Prompt</TableHead>
        <TableHead>Response</TableHead>
        <TableHead className="w-[60px]">Raw</TableHead>
        <TableHead className="border-l">Category</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-[140px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};