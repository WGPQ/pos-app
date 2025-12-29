"use client"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table"
import Badge from "../ui/badge";
import { Eye } from "lucide-react";
import IconButton from "../ui/icon-button";
import { useSales } from "@/hooks/useSales";
import Loading from "../ui/loading";
import { useState } from "react";
import ReceiptModal from "./ReceiptModal";
import type { Sale } from "@/services/salesService";

const ListsPos = () => {
  const { salesQuery } = useSales();
  const sales = salesQuery.data ?? [];
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleViewOrder = (sale: Sale) => {
    setSelectedSale(sale);
    setShowReceipt(true);
  }

  if (salesQuery.isLoading) {
    return <Loading message="Cargando ventas..." />
  }

  return (
    <>
      <div className="max-w-full overflow-x-auto">
      <div className="min-w-[1102px]">
        <div className="overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  N° Recibo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  Fecha
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  Cliente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="w-1/8 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sales.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.receiptNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ${parseFloat(order.total.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.client ? `${order.client.ci} - ${order.client.name}` : "Consumidor final"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Completed"
                          ? "success"
                          : order.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 w-1/8 truncate">
                      <IconButton
                        icon={<Eye className="h-5 w-5 text-gray-400 hover:text-purple-700 dark:hover:text-gray-300 mr-2" />}
                        onClick={() => { handleViewOrder(order) }}
                      />
                  </TableCell>
                </TableRow>
              ))}
              {!sales.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                  >
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    {selectedSale && (
      <ReceiptModal
        sale={selectedSale}
        open={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setSelectedSale(null);
        }}
      />
    )}
    </>
  )
}

export default ListsPos
