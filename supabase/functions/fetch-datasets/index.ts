import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { category, useCustomSearch, searchQuery, page = 1, perPage = 12 } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    const huggingFaceApiKey = profile?.api_keys?.huggingface
    const githubToken = profile?.api_keys?.github

    if (!huggingFaceApiKey && !githubToken) {
      throw new Error('No API keys found (Hugging Face or GitHub)')
    }

    const results = {
      huggingface: [],
      github: []
    }

    // Fetch from Hugging Face if API key exists
    if (huggingFaceApiKey) {
      const baseUrl = 'https://huggingface.co/api/datasets'
      const params = new URLSearchParams()

      if (useCustomSearch && searchQuery) {
        params.append('search', searchQuery.toLowerCase())
      } else if (category) {
        params.append('search', category.toLowerCase())
      }

      params.append('sort', 'downloads')
      params.append('limit', perPage.toString())
      params.append('offset', ((page - 1) * perPage).toString())
      
      const searchUrl = `${baseUrl}?${params.toString()}`
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const datasets = await response.json()
        if (Array.isArray(datasets)) {
          results.huggingface = datasets.map(dataset => ({
            id: dataset.id,
            title: dataset.id.split('/').pop(),
            description: dataset.description || 'No description available',
            downloads: dataset.downloads || 0,
            likes: dataset.likes || 0,
            source: 'huggingface',
            url: `https://huggingface.co/datasets/${dataset.id}`
          }))
        }
      }
    }

    // Fetch from GitHub if token exists
    if (githubToken) {
      let searchTerms = []
      
      if (useCustomSearch && searchQuery) {
        searchTerms.push(searchQuery)
      } else if (category) {
        searchTerms.push(category)
      }
      
      searchTerms.push('dataset')
      
      const query = encodeURIComponent(`${searchTerms.join(' ')} in:name,description,readme language:python stars:>10`)
      const githubUrl = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${perPage}&page=${page}`
      
      const response = await fetch(githubUrl, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.items) {
          results.github = data.items.map((repo: any) => ({
            id: repo.full_name,
            title: repo.name,
            description: repo.description || 'No description available',
            downloads: repo.forks_count || 0,
            likes: repo.stargazers_count || 0,
            source: 'github',
            url: repo.html_url,
            language: repo.language,
            topics: repo.topics || []
          }))
        }
      }
    }

    return new Response(
      JSON.stringify(results),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in fetch-datasets function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
