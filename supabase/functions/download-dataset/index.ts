import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  const lines = rawText.split(/\r?\n/)
  const headers = parseCSVLine(lines[0])
  
  const data = lines.slice(1)
    .filter(line => line.trim())
    .map(line => parseCSVLine(line))
    .filter(row => row.length === headers.length)
  
  return { headers, data }
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { datasetId, format } = await req.json()
    
    if (!datasetId) {
      throw new Error('Dataset ID is required')
    }

    if (!format || !['csv', 'txt', 'zip'].includes(format)) {
      throw new Error('Invalid format specified')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (datasetError) {
      console.error('Error fetching dataset:', datasetError)
      throw new Error('Failed to fetch dataset')
    }

    if (!dataset) {
      throw new Error('Dataset not found')
    }

    if (!dataset.file_path) {
      throw new Error('Dataset file not found')
    }

    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('datasets')
      .download(dataset.file_path)

    if (storageError) {
      console.error('Storage error:', storageError)
      throw new Error('Failed to download dataset file')
    }

    if (!fileData) {
      throw new Error('No file data received')
    }

    // Process the file content to match table view
    const rawContent = await fileData.text()
    const { headers, data } = parseCSVContent(rawContent)
    const filteredData = filterEasyJailbreakData(data, headers)

    // Format the data for download
    let processedContent = headers.join(',') + '\n'
    processedContent += filteredData.map(row => 
      row.map((cell, index) => {
        const isPromptColumn = headers[index].toLowerCase().includes('prompt')
        const formattedCell = isPromptColumn ? formatPromptText(cell) : cell
        // Escape quotes and wrap in quotes if contains comma or newline
        const escapedCell = formattedCell.replace(/"/g, '""')
        return /[,\n"]/.test(escapedCell) ? `"${escapedCell}"` : escapedCell
      }).join(',')
    ).join('\n')

    return new Response(processedContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': getContentType(format),
        'Content-Disposition': `attachment; filename="${dataset.name}.${format}"`,
      },
    })

  } catch (error) {
    console.error('Download dataset error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function getContentType(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv'
    case 'txt':
      return 'text/plain'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}