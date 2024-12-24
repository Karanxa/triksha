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
  if (!text) return '';
  
  // Remove markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // Remove numbered lists
  text = text.replace(/^\d+\.\s*/gm, '')
  
  // Remove markdown bold
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  
  // Remove "Feel free to..." and similar ending phrases
  text = text.replace(/Feel free to.*$/i, '')
  text = text.replace(/You can.*$/i, '')
  text = text.replace(/Sure!.*$/i, '')
  text = text.replace(/Certainly!.*$/i, '')
  
  // Remove empty lines and trim
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
  
  return text.trim()
}

const parseCSVLine = (line: string): string[] => {
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim())
      currentValue = ''
    } else {
      currentValue += char
    }
  }
  
  values.push(currentValue.trim())
  return values.map(v => v.replace(/^"|"$/g, ''))
}

const parseCSVContent = (rawText: string) => {
  const lines = rawText.split(/\r?\n/).filter(line => line.trim())
  
  // Parse headers and data
  const headers = parseCSVLine(lines[0])
  console.log('CSV Headers:', headers)
  
  // Process all rows after headers
  const data = lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    console.log('Processing row:', values)
    return values
  }).filter(row => row.some(cell => cell.trim().length > 0)) // Filter out completely empty rows
  
  console.log('Total rows processed:', data.length)
  return { headers, data }
}

export const DatasetContent = ({ viewType, content }: DatasetContentProps) => {
  if (!content) return null

  if (viewType === 'table' && content.type === 'csv') {
    const { headers, data } = parseCSVContent(content.raw)

    return (
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, i) => (
                <TableHead key={i} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell 
                    key={j} 
                    className="max-w-xl break-words whitespace-pre-wrap"
                  >
                    {formatPromptText(cell)}
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
      <pre className="whitespace-pre-wrap p-4 bg-background rounded-lg border">
        {content.raw}
      </pre>
    </ScrollArea>
  )
}