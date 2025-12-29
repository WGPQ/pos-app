'use client'

import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../ui/modal'
import Badge from '../ui/badge'
import Button from '../ui/button'
import { useSales } from '@/hooks/useSales'
import { useProductStore } from '@/store/productStore'
import type { Sale } from '@/services/salesService'

interface ReceiptModalProps {
  sale: Sale
  open: boolean
  onClose: () => void
}

const ReceiptModal = ({ sale, open, onClose }: ReceiptModalProps) => {
  const { cancelSale } = useSales()
  const updateProductStore = useProductStore((state) => state.updateProduct)
  const [currentSale, setCurrentSale] = useState<Sale>(sale)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setCurrentSale(sale)
    setMessage(null)
  }, [sale])

  const subtotal = useMemo(() => {
    return currentSale.items.reduce((acc, item) => acc + Number(item.subtotal), 0)
  }, [currentSale.items])

  const handleCancel = async () => {
    if (currentSale.status === "Cancelled" || cancelSale.isPending) return
    const confirmed = window.confirm("¿Deseas anular este recibo y devolver el stock?")
    if (!confirmed) return

    try {
      const result = await cancelSale.mutateAsync(currentSale.id)
      result.updatedProducts.forEach((product) => {
        updateProductStore(product)
      })
      setCurrentSale(result.sale)
      setMessage("Recibo anulado y stock devuelto.")
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo anular el recibo."
      setMessage(text)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-[920px] m-4">
      <div className="no-scrollbar relative w-full max-w-[920px] overflow-y-auto rounded-3xl bg-white p-6 pr-14 dark:bg-gray-900 lg:p-10 lg:pr-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <span className="text-lg font-semibold">P</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Papelería Central</h2>
                <p className="text-sm text-gray-500">RUC 0999999999</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Av. Principal 123</p>
              <p>Quito, Ecuador</p>
              <p>ventas@papeleria.com</p>
              <p>+593 99 111 2222</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-left lg:items-end lg:text-right">
            <Badge size="sm" color={currentSale.status === "Completed" ? "success" : "error"}>
              {currentSale.status === "Completed" ? "Entregado" : "Anulado"}
            </Badge>
            <p className="text-2xl font-semibold text-gray-900">#{currentSale.receiptNumber}</p>
            <p className="text-sm text-gray-500">
              {new Date(currentSale.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Datos del cliente
            </p>
            <div className="mt-3 space-y-1 text-sm text-gray-700">
              {currentSale.client ? (
                <>
                  <p className="font-medium">{currentSale.client.name}</p>
                  <p>CI: {currentSale.client.ci}</p>
                </>
              ) : (
                <p className="font-medium">Consumidor final</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nota
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Gracias por comprar en nuestra papelería. Presenta este recibo para cualquier
              reclamo o devolución.
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
            <span className="col-span-5">Producto</span>
            <span className="col-span-3">Precio unitario</span>
            <span className="col-span-2">Cantidad</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          <div className="divide-y divide-gray-100">
            {currentSale.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-sm text-gray-700">
                <span className="col-span-5 font-medium">{item.productName}</span>
                <span className="col-span-3">${Number(item.unitPrice).toFixed(2)}</span>
                <span className="col-span-2">{item.quantity}</span>
                <span className="col-span-2 text-right">${Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-sm text-gray-500">
            {message && (
              <p className={currentSale.status === "Cancelled" ? "text-red-500" : "text-green-600"}>
                {message}
              </p>
            )}
          </div>
          <div className="w-full max-w-sm space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Sub Total</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>IVA</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>${Number(currentSale.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={handleCancel}
            disabled={currentSale.status === "Cancelled" || cancelSale.isPending}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700"
          >
            {currentSale.status === "Cancelled" ? "Recibo anulado" : "Anular recibo"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ReceiptModal
