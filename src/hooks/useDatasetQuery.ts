import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface UseDatasetQueryProps {
  selectedCategory: string
  useCustomSearch: boolean
  searchQuery: string
  page: number
  perPage: number
}

export const useDatasetQuery = ({ 
  selectedCategory, 
  useCustomSearch, 
  searchQuery, 
  page, 
  perPage 
}: UseDatasetQueryProps) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['datasets', selectedCategory, useCustomSearch, searchQuery, page],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-datasets', {
          body: { 
            category: selectedCategory,
            useCustomSearch,
            searchQuery: useCustomSearch ? searchQuery : undefined,
            page,
            perPage
          }
        })

        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching datasets",
            description: error.message
          })
          return { huggingface: [], github: [] }
        }

        return data
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching datasets",
          description: error.message
        })
        return { huggingface: [], github: [] }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false
  })
}