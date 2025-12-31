'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Button from '../ui/button'
import { Loader2, Upload } from 'lucide-react'
import { Product } from '@/services/productService'
import { useProducts } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

interface ImportItemsProps {
  items: Product[]
  className?: string
}

type ImportStatus = {
  type: "success" | "error"
  message: string
} | null

const HEADER_ALIASES: Record<string, string> = {
  id: "id",
  producto: "name",
  nombre: "name",
  sku: "sku",
  cantidad: "quantity",
  costo: "cost",
  precio: "price",
  estado: "state",
}

const HEADER_LABELS: Record<string, string> = {
  id: "ID",
  name: "Producto",
  sku: "SKU",
  quantity: "Cantidad",
  cost: "Costo",
  price: "Precio",
  state: "Estado",
}

const REQUIRED_HEADERS = ["id", "name", "sku", "quantity", "cost", "price", "state"]

const normalizeHeader = (value: unknown) => {
  return String(value ?? "").trim().toLowerCase()
}

const isEmptyValue = (value: unknown) => {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  return false
}

const parseNumber = (value: unknown) => {
  if (isEmptyValue(value)) return null
  if (typeof value === "number") return value
  const cleaned = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".")
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

const parseState = (value: unknown) => {
  const normalized = String(value ?? "").trim().toLowerCase()
  if (!normalized) return null
  if (["en tienda", "disponible", "si", "sí", "true", "1", "stock"].includes(normalized)) {
    return true
  }
  if (["agotado", "no", "false", "0", "sin stock"].includes(normalized)) {
    return false
  }
  return null
}

const formatErrors = (errors: string[]) => {
  if (errors.length <= 3) return errors.join(" | ")
  return `${errors.slice(0, 3).join(" | ")} | +${errors.length - 3} más`
}

const ImportItems = ({ items, className }: ImportItemsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { addProduct, editProduct } = useProducts()
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<ImportStatus>(null)

  useEffect(() => {
    if (!status || status.type === "error") return
    const timer = setTimeout(() => setStatus(null), 6000)
    return () => clearTimeout(timer)
  }, [status])

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (file: File) => {
    setIsImporting(true)
    setStatus(null)

    try {
      const { read, utils } = await import("xlsx")
      const arrayBuffer = await file.arrayBuffer()
      const workbook = read(arrayBuffer)
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        setStatus({ type: "error", message: "No se encontró una hoja válida en el Excel." })
        return
      }
      const worksheet = workbook.Sheets[sheetName]
      const rows = utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as unknown[][]

      if (!rows.length) {
        setStatus({ type: "error", message: "El archivo no tiene datos para importar." })
        return
      }

      const headerRow = rows[0] ?? []
      const columnIndex = new Map<string, number>()

      headerRow.forEach((header, index) => {
        const normalized = normalizeHeader(header)
        const key = HEADER_ALIASES[normalized]
        if (key && !columnIndex.has(key)) {
          columnIndex.set(key, index)
        }
      })

      const missingHeaders = REQUIRED_HEADERS.filter((key) => !columnIndex.has(key))
      if (missingHeaders.length) {
        const labels = missingHeaders.map((key) => HEADER_LABELS[key])
        setStatus({
          type: "error",
          message: `Faltan columnas: ${labels.join(", ")}.`,
        })
        return
      }

      const productById = new Map(items.map((item) => [item.id, item]))
      const seenIds = new Set<number>()
      const errors: string[] = []
      const updates: Array<{ id: number; data: Partial<Product> }> = []
      const creates: Array<Omit<Product, "id">> = []

      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex] ?? []
        const rowNumber = rowIndex + 1
        const getValue = (key: string) => row[columnIndex.get(key)!]
        const rowErrors: string[] = []

        const valuesToCheck = REQUIRED_HEADERS.map((key) => getValue(key))
        if (valuesToCheck.every(isEmptyValue)) {
          continue
        }

        const rawId = getValue("id")
        let id: number | null = null
        if (!isEmptyValue(rawId)) {
          const numericId = parseNumber(rawId)
          if (numericId === null || !Number.isInteger(numericId) || numericId <= 0) {
            rowErrors.push(`Fila ${rowNumber}: ID inválido.`)
          } else {
            id = numericId
            if (seenIds.has(id)) {
              rowErrors.push(`Fila ${rowNumber}: ID duplicado (${id}).`)
            } else {
              seenIds.add(id)
            }
          }
        }

        const name = String(getValue("name") ?? "").trim()
        if (!name) {
          rowErrors.push(`Fila ${rowNumber}: Producto requerido.`)
        }

        const sku = String(getValue("sku") ?? "").trim()
        if (!sku) {
          rowErrors.push(`Fila ${rowNumber}: SKU requerido.`)
        }

        const quantityValue = parseNumber(getValue("quantity"))
        if (
          quantityValue === null ||
          !Number.isInteger(quantityValue) ||
          quantityValue < 0
        ) {
          rowErrors.push(`Fila ${rowNumber}: Cantidad inválida.`)
        }

        const costValue = parseNumber(getValue("cost"))
        if (costValue === null || costValue < 0) {
          rowErrors.push(`Fila ${rowNumber}: Costo inválido.`)
        }

        const priceValue = parseNumber(getValue("price"))
        if (priceValue === null || priceValue < 0) {
          rowErrors.push(`Fila ${rowNumber}: Precio inválido.`)
        }

        const stateValue = parseState(getValue("state"))
        if (stateValue === null) {
          rowErrors.push(`Fila ${rowNumber}: Estado inválido.`)
        }

        if (rowErrors.length) {
          errors.push(...rowErrors)
          continue
        }

        const baseData = {
          name,
          sku,
          quantity: quantityValue ?? 0,
          cost: costValue ?? 0,
          price: priceValue ?? 0,
          in_store: stateValue ?? true,
        }

        if (id && productById.has(id)) {
          updates.push({ id, data: baseData })
        } else {
          creates.push({
            ...baseData,
            image: "",
            description: "",
            category: "oficina",
          })
        }
      }

      if (errors.length) {
        setStatus({
          type: "error",
          message: `Errores en el Excel: ${formatErrors(errors)}`,
        })
        return
      }

      for (const update of updates) {
        await editProduct.mutateAsync({ id: update.id, data: update.data })
      }

      for (const create of creates) {
        await addProduct.mutateAsync(create)
      }

      setStatus({
        type: "success",
        message: `Importación completa: ${updates.length} actualizados, ${creates.length} nuevos.`,
      })
    } catch (error) {
      console.error("Error importing file:", error)
      setStatus({
        type: "error",
        message: "No se pudo importar el archivo. Verifica el formato e intenta nuevamente.",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImportFile(file)
    }
    event.target.value = ""
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        className={cn("h-9 bg-transparent", className)}
        onClick={handlePickFile}
        disabled={isImporting}
      >
        {isImporting ? (
          <>
            <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
            <span className="hidden sm:inline">Importando</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
          </>
        )}
      </Button>
      {status && (
        <span
          className={`text-xs ${
            status.type === "error" ? "text-red-500" : "text-green-600"
          }`}
        >
          {status.message}
        </span>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default ImportItems
