export const parseCSVContent = (text: string) => {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''))
  
  const data = lines.slice(1).map(line => {
    let values = []
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
        values.push(currentValue.trim().replace(/^"|"$/g, ''))
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    
    values.push(currentValue.trim().replace(/^"|"$/g, ''))
    return values
  }).filter(row => row.length === headers.length && row.some(cell => cell.length > 0))

  return { headers, data }
}

export const cleanTextContent = (text: string) => {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
}