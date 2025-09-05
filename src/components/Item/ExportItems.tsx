import React from 'react'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'

const ExportItems = () => {
  return (
    <Button variant="outline" size="sm" className="h-9 bg-transparent">
      <Download className="w-4 h-4 mr-2" />
      Export
    </Button>
  )
}

export default ExportItems
