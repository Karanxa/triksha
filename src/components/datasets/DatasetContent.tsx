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

  if (viewType === 'table' && content.type === 'csv') {
    return (
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              {content.headers.map((header, i) => (
                <TableHead key={i} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.data.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell 
                    key={j} 
                    className="max-w-xl break-words"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-[60vh]">
      <pre className="whitespace-pre-wrap p-4 bg-muted rounded-lg">
        {content.raw}
      </pre>
    </ScrollArea>
  )
}