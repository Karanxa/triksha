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

const formatPromptText = (text: string): string => {
  // Remove markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // Remove numbered lists
  text = text.replace(/^\d+\.\s*/gm, '')
  
  // Remove markdown bold
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  
  // Remove "Feel free to..." and similar ending phrases
  text = text.replace(/Feel free to.*$/i, '')
  text = text.replace(/You can.*$/i, '')
  
  // Remove empty lines and trim
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
  
  return text.trim()
}

const filterEasyJailbreakData = (data: string[][], headers: string[]): string[][] => {
  const methodIndex = headers.findIndex(h => h.toLowerCase() === 'method')
  const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category')
  
  if (methodIndex === -1 && categoryIndex === -1) return data

  return data.filter(row => {
    const method = methodIndex !== -1 ? row[methodIndex]?.toLowerCase() : ''
    const category = categoryIndex !== -1 ? row[categoryIndex]?.toLowerCase() : ''
    return method === 'recipe' || category === 'easyjailbreak' || category === 'recipe'
  })
}

export const DatasetContent = ({ viewType, content }: DatasetContentProps) => {
  if (!content) return null

  if (viewType === 'table' && content.type === 'csv') {
    const filteredData = filterEasyJailbreakData(content.data, content.headers)

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
            {filteredData.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => {
                  // Format the prompt column if it exists
                  const isPromptColumn = content.headers[j].toLowerCase().includes('prompt')
                  const formattedCell = isPromptColumn ? formatPromptText(cell) : cell
                  
                  return (
                    <TableCell 
                      key={j} 
                      className="max-w-xl break-words whitespace-pre-wrap"
                    >
                      {formattedCell}
                    </TableCell>
                  )
                })}
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