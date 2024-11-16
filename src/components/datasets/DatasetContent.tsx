import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DatasetContentProps {
  viewType: 'table' | 'raw'
  content: {
    type: 'csv'
    headers: string[]
    data: string[][]
    raw: string
  } | null
}

export const DatasetContent = ({ viewType, content }: DatasetContentProps) => {
  if (!content) return null

  return viewType === 'table' ? (
    <ScrollArea className="h-[60vh]">
      <Table>
        <TableHeader>
          <TableRow>
            {content.headers.map((header, i) => (
              <TableHead key={i}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {content.data.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  ) : (
    <ScrollArea className="h-[60vh]">
      <pre className="whitespace-pre-wrap p-4 bg-muted rounded-lg">
        {content.raw}
      </pre>
    </ScrollArea>
  )
}