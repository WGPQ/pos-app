
import {
  Edit,
  Trash2,
} from "lucide-react"
import ItemDetails from "./ItemDetails";
import DeleteItem from "./DeleteItem";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/services/productService";
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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

  const formatDate = (value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
                    className="w-3/6 px-5 py-3 text-base font-semibold text-gray-600 text-start"
                  >
                    Producto
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 text-base font-semibold text-gray-600 text-start"
                  >
                    Fecha
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 text-base font-semibold text-gray-600 text-start"
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 text-base font-semibold text-gray-600 text-start"
                  >
                    Precio
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/8 px-5 py-3 text-base font-semibold text-gray-600 text-start"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/60">
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openProductDetails(product)}
                          className="flex items-center justify-center"
                          aria-label={`Ver detalles de ${product.name}`}
                        >
                          <Image
                            width={56}
                            height={56}
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        </button>
                        <div className="min-w-0">
                          <button
                            onClick={() => openProductDetails(product)}
                            className="block truncate text-base font-semibold text-gray-900"
                          >
                            {product.name}
                          </button>
                          <p className="text-sm text-gray-500">
                            {product.category || "General"} · SKU: {product.sku}
                          </p>
                          <p className="text-xs text-gray-400">
                            Stock: {product.quantity}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600">
                      {formatDate(product.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            product.in_store ? "bg-success-500" : "bg-error-500"
                          }`}
                        />
                        <span>{product.in_store ? "En stock" : "Agotado"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-base font-semibold text-gray-900">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="dropdown-toggle"
                            aria-label={`Editar ${product.name}`}
                          >
                            <Edit className="h-5 w-5 text-gray-400 hover:text-purple-700 dark:hover:text-gray-300 mr-2" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                          Editar
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="dropdown-toggle"
                            aria-label={`Eliminar ${product.name}`}
                          >
                            <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-700 dark:hover:text-gray-300" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                          Eliminar
                        </TooltipContent>
                      </Tooltip>
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
