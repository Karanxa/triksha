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
  const headers = parseCSVLine(lines[0])
  
  // Find the prompt column index (case-insensitive)
  const promptIndex = headers.findIndex(header => 
    header.toLowerCase().includes('prompt')
  )

  console.log('Headers:', headers)
  console.log('Found prompt column at index:', promptIndex)

  if (promptIndex === -1) {
    console.error('No prompt column found')
    return { headers: ['prompt'], data: [] }
  }

  // Only process rows that have a value in the prompt column
  const data = lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line)
      // Return an array with just the prompt value
      return [values[promptIndex]].filter(Boolean)
    })
    .filter(row => row.length > 0 && row[0]?.trim())
  
  console.log('Number of valid prompts:', data.length)
  
  return { headers: ['prompt'], data }
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