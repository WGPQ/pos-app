import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
} from "lucide-react"
interface SearchItemsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}
const SearchItems: React.FC<SearchItemsProps> = ({
  searchTerm,
  setSearchTerm,
}) => {

  const hasActiveFilters = searchTerm

  const clearAllFilters = () => {
    setSearchTerm("")
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
        <Input
          placeholder="Buscar productos..."
          className="pl-10 w-80 h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
          {searchTerm && `Buscar: "${searchTerm}"`}
          <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={clearAllFilters}>
            ×
          </button>
        </Badge>
      )}
    </div>

  )
}

export default SearchItems
