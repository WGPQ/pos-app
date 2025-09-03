'use client'
import AddItem from '@/components/Item/AddItem'
import DeleteItem from '@/components/Item/DeleteItem'
import ItemDetails from '@/components/Item/ItemDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@prisma/client'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Copy,
} from "lucide-react"
import { useMemo, useState } from 'react'

const ProductsPage = () => {
  const { productsQuery, removeProduct } = useProducts();
  const products = productsQuery.data || [];
  const [currentPage, setCurrentPage] = useState(2)
  const [isNewProductOpen, setIsNewProductOpen] = useState(false)
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      // const matchesStatus = statusFilter.length === 0 || statusFilter.includes(product.status)
      const matchesStatus = statusFilter.length === 0;
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(product.category)

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchTerm, statusFilter, categoryFilter, products])

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter([])
    setCategoryFilter([])
  }

  const hasActiveFilters = searchTerm || statusFilter.length > 0 || categoryFilter.length > 0

  const openProductDetails = (product: (typeof products)[0]) => {
    setSelectedProduct(product as unknown as Product)
    setIsProductDetailsOpen(true)
  }

  const handleEditProduct = (product: (typeof products)[0]) => {
    setSelectedProduct(product as unknown as Product)
    setIsNewProductOpen(true)
  }

  const handleDeleteProduct = (product: (typeof products)[0]) => {
    setProductToDelete(product as unknown as Product)
    setIsDeleteDialogOpen(true)
  }

  const handleDuplicateProduct = (product: (typeof products)[0]) => {
    console.log("Duplicate product:", product)
    // Here you would typically create a copy of the product
  }

  const confirmDeleteProduct = () => {
    try {
      if (productToDelete) {
        removeProduct.mutate(productToDelete.id);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }
  return (
    <>
      {/* Products Section */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Products Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Inventario</h2>
          </div>

          {/* Search and Actions */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-10 w-80 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {statusFilter.length > 0 && `Status: ${statusFilter.join(", ")}`}
                  {statusFilter.length > 0 && categoryFilter.length > 0 && ", "}
                  {categoryFilter.length > 0 && `Category: ${categoryFilter.join(", ")}`}
                  {searchTerm && (statusFilter.length > 0 || categoryFilter.length > 0) && ", "}
                  {searchTerm && `Buscar: "${searchTerm}"`}
                  <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={clearAllFilters}>
                    ×
                  </button>
                </Badge>
              )}

              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("Active")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "Active"])
                      } else {
                        setStatusFilter(statusFilter.filter((s) => s !== "Active"))
                      }
                    }}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes("Out of Stock")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, "Out of Stock"])
                      } else {
                        setStatusFilter(statusFilter.filter((s) => s !== "Out of Stock"))
                      }
                    }}
                  >
                    Out of Stock
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={categoryFilter.includes("CLOTHING")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCategoryFilter([...categoryFilter, "CLOTHING"])
                      } else {
                        setCategoryFilter(categoryFilter.filter((c) => c !== "CLOTHING"))
                      }
                    }}
                  >
                    Clothing
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={categoryFilter.includes("SHOES")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCategoryFilter([...categoryFilter, "SHOES"])
                      } else {
                        setCategoryFilter(categoryFilter.filter((c) => c !== "SHOES"))
                      }
                    }}
                  >
                    Shoes
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={categoryFilter.includes("BAG")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCategoryFilter([...categoryFilter, "BAG"])
                      } else {
                        setCategoryFilter(categoryFilter.filter((c) => c !== "BAG"))
                      }
                    }}
                  >
                    Bag
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={categoryFilter.includes("JEWELRY")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCategoryFilter([...categoryFilter, "JEWELRY"])
                      } else {
                        setCategoryFilter(categoryFilter.filter((c) => c !== "JEWELRY"))
                      }
                    }}
                  >
                    Jewelry
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>

            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" className="h-9 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button> */}
              <Button
                size="sm"
                className="h-9 bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsNewProductOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>

          {/* Products Table */}
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
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
                      <div className="text-sm text-gray-900 whitespace-pre-line">{product.cost.toString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{product.price}</span>
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
                        {product.in_store ? "In Store" : "Out of Stock"}
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

          {/* Pagination */}
          {/* <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 bg-transparent"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </Button>
                <Button variant="default" size="sm" className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700">
                  2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 bg-transparent"
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 bg-transparent"
                  onClick={() => setCurrentPage(4)}
                >
                  4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 bg-transparent"
                  onClick={() => setCurrentPage(5)}
                >
                  5
                </Button>
                <span className="px-2 text-sm text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 bg-transparent"
                  onClick={() => setCurrentPage(47)}
                >
                  47
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div> */}
        </div>
      </div>

      <AddItem
        isNewProductOpen={isNewProductOpen}
        setIsNewProductOpen={(status) => {
          setIsNewProductOpen(status);
          if (status === false) {
            setSelectedProduct(null);
          }
        }}
        selectedProduct={selectedProduct}
      />

      <ItemDetails
        isProductDetailsOpen={isProductDetailsOpen}
        setIsProductDetailsOpen={setIsProductDetailsOpen}
        selectedProduct={selectedProduct}
      />
      <DeleteItem
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        productToDelete={productToDelete}
        confirmDeleteProduct={confirmDeleteProduct}
      />
    </>
  )
}

export default ProductsPage
