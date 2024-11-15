import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { AttackCategorySelect } from "./AttackCategorySelect"

interface DatasetSearchControlsProps {
  useCustomSearch: boolean
  setUseCustomSearch: (value: boolean) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
}

export const DatasetSearchControls = ({
  useCustomSearch,
  setUseCustomSearch,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: DatasetSearchControlsProps) => {
  const handleCustomSearchToggle = (checked: boolean) => {
    setUseCustomSearch(checked)
    if (checked) {
      setSelectedCategory("")
    } else {
      setSearchQuery("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Switch
          checked={useCustomSearch}
          onCheckedChange={handleCustomSearchToggle}
          id="custom-search"
        />
        <label htmlFor="custom-search" className="text-sm">
          Use custom search keywords
        </label>
      </div>

      {!useCustomSearch && (
        <div className="w-full">
          <AttackCategorySelect 
            value={selectedCategory} 
            onValueChange={setSelectedCategory} 
          />
        </div>
      )}

      {useCustomSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>
  )
}