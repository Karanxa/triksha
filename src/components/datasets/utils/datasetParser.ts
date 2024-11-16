export const parseCSVContent = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim() !== '')
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/(^"|"$)/g, '')
  )
  
  const data = lines.slice(1).map(line => {
    const values = []
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
    
    return values
  }).filter(row => row.length === headers.length)

  return { headers, data }
}

export const cleanTextContent = (text: string) => {
  return text.split('\n').map(line => {
    if (line.startsWith('Enhanced Prompt:')) {
      return line.replace('Enhanced Prompt:', '').trim()
    }
    return line
  }).join('\n')
}