
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import ItemDetails from "./ItemDetails";
import DeleteItem from "./DeleteItem";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/services/productService";
import Image from 'next/image';

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                {/* <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td> */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      alt={product.name}
                      width={40}
                      height={40}
                      src={product.image || "/placeholder.svg"}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <button
                      onClick={() => openProductDetails(product)}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {product.name}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{product.sku}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{product.quantity}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 whitespace-pre-line">${parseFloat(product.cost.toString()).toFixed(2)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">${parseFloat(product.price.toString()).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={product.in_store ? "default" : "destructive"}
                    className={
                      product.in_store
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                  >
                    {product.in_store ? "En tienda" : "Agotado"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
                            onClick={() => handleDuplicateProduct(product)}
                            className="cursor-pointer"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate Product
                          </DropdownMenuItem> */}
                      {/* <DropdownMenuSeparator /> */}
                      <DropdownMenuItem
                        onClick={() => handleDeleteProduct(product)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDetailsProduct && <ItemDetails />}
      {showDeleteProduct && <DeleteItem />}
    </>
  )
}

export default ListItems
