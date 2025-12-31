'use client'

import Button from '../ui/button'
import { Download } from 'lucide-react'
import { Product } from '@/services/productService'
import { cn } from '@/lib/utils'

interface ExportItemsProps {
  items: Product[]
  className?: string
}

const ExportItems = ({ items, className }: ExportItemsProps) => {
  const handleExport = async () => {
    if (!items.length) return;
    const { utils, writeFile } = await import('xlsx');

    const rows = items.map((item) => ({
      ID: item.id,
      Producto: item.name,
      SKU: item.sku,
      Cantidad: item.quantity,
      Costo: Number(item.cost),
      Precio: Number(item.price),
      Estado: item.in_store ? "En tienda" : "Agotado",
    }));

    const worksheet = utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Productos");

    const dateStamp = new Date().toISOString().split("T")[0];
    writeFile(workbook, `productos_${dateStamp}.xlsx`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 bg-transparent", className)}
      onClick={handleExport}
      disabled={!items.length}
    >
      <Download className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">Exportar</span>
    </Button>
  )
}

export default ExportItems
