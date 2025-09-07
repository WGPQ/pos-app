
import {
  Edit,
  Trash2,
} from "lucide-react"
import Badge from '../ui/badge';
import ItemDetails from "./ItemDetails";
import DeleteItem from "./DeleteItem";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/services/productService";
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { useState } from 'react';

interface ListItemsProps {
  products: Product[];
}

const ListItems = ({ products }: ListItemsProps) => {
  const setShowNewProduct = useProductStore((state) => state.setShowNewProduct);
  const setSelectedProduct = useProductStore((state) => state.setSelectedProduct);
  const showDetailsProduct = useProductStore((state) => state.showDetailsProduct);
  const setShowDetailsProduct = useProductStore((state) => state.setShowDetailsProduct);
  const showDeleteProduct = useProductStore((state) => state.showDeleteProduct);
  const setShowDeleteProduct = useProductStore((state) => state.setShowDeleteProduct);

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowDetailsProduct(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowNewProduct(true);
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteProduct(true);
  }

  return (
    <>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full border-collapse">
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-2/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Producto
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    SKU
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Cantidad
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Costo
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Precio
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/8 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <span></span>
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => (
                  <TableRow key={product.id}>
                    {/* Producto */}
                    <TableCell className="px-2 py-4 sm:px-2 text-start w-2/6">
                      <div className="flex items-center gap-3">
                        <Image
                          width={40}
                          height={40}
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => openProductDetails(product)}
                          className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">
                          {product.name}
                        </button>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-1/6 truncate">
                      {product.sku}
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-1/6">
                      {product.quantity}
                    </TableCell>

                    {/* Costo */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-1/6">
                      ${parseFloat(product.cost.toString()).toFixed(2)}
                    </TableCell>

                    {/* Precio */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-1/6">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </TableCell>

                    {/* Proveedor */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-1/6 truncate">
                      <Badge size="sm" color={product.in_store ? "success" : "error"} > {product.in_store ? "En tienda" : "Agotado"} </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3  text-gray-500 text-center text-theme-sm dark:text-gray-400 w-1/8 truncate">
                      <button onClick={() => handleEditProduct(product)} className="dropdown-toggle">
                        <Edit className="text-gray-400 hover:text-purple-700 dark:hover:text-gray-300 mr-2" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product)} className="dropdown-toggle">
                        <Trash2 className="text-gray-400 hover:text-red-700 dark:hover:text-gray-300" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {showDetailsProduct && <ItemDetails />}
      {showDeleteProduct && <DeleteItem />}
    </>
  )
}

export default ListItems
