import React from 'react'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationItemsProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
}

const PaginationItems: React.FC<PaginationItemsProps> = ({ currentPage, setCurrentPage, totalPages }) => {
  const getPageNumbers = () => {
    const pages = []
    let start = Math.max(2, currentPage - 2)
    let end = Math.min(totalPages - 1, currentPage + 2)

    if (currentPage <= 3) {
      start = 2
      end = Math.min(5, totalPages - 1)
    }

    if (currentPage >= totalPages - 2) {
      start = Math.max(totalPages - 4, 2)
      end = totalPages - 1
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const getButtonClass = (page: number) =>
    currentPage === page
      ? 'w-8 h-8 p-0 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
      : 'w-8 h-8 p-0 bg-transparent border-purple-200 text-purple-600 hover:bg-purple-50'

  return (
    <div className="px-6 py-4 border-t border-purple-100 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 bg-transparent border-purple-200 text-purple-600 hover:bg-purple-50"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={getButtonClass(1)}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Button>

        {pageNumbers[0] > 2 && <span className="px-2 text-sm text-purple-400">...</span>}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant="outline"
            size="sm"
            className={getButtonClass(page)}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <span className="px-2 text-sm text-purple-400">...</span>
        )}

        {totalPages > 1 && (
          <Button
            variant="outline"
            size="sm"
            className={getButtonClass(totalPages)}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 bg-transparent border-purple-200 text-purple-600 hover:bg-purple-50"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default PaginationItems
