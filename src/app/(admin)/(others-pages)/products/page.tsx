'use client'
import { useEffect, useMemo, useState } from 'react'

import ListItems from '@/components/Item/ListItems'
import SearchItems from '@/components/Item/SearchItems'
import AddButtonItem from '@/components/Item/AddButtonItem'
import PaginationItems from '@/components/Item/PaginationItems'

import { useProductStore } from '@/store/productStore'
import { Product } from '@/services/productService'
import { useProducts } from '@/hooks/useProducts'


export const applyFilters = (products: Product[], query: string): Product[] => {
  if (!query) return products;

  const loweredQuery = query.toLowerCase();

  const properties: (keyof Pick<Product, "name" | "sku" | "description">)[] = [
    "name",
    "sku",
    "description",
  ];

  return products.filter((item) =>
    properties.some((prop) =>
      item[prop]?.toLowerCase().includes(loweredQuery)
    )
  );
};
const itemsPerPage = 6;

const ProductsPage = () => {
  const { productsQuery } = useProducts();
  const hasLoadData = useProductStore((state) => state.hasLoadData);
  const products = useProductStore((state) => state.products);
  const [currentPage, setCurrentPage] = useState(2)
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return applyFilters(products, searchTerm.toLowerCase());
  }, [searchTerm, products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredProducts]);


  useEffect(() => {
    if (!hasLoadData) {
      productsQuery.refetch();
    }
  }, [hasLoadData, productsQuery]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredProducts, currentPage]);

  return (
    <>
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[86vh] flex flex-col">
          {/* Título */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Inventario</h2>
          </div>
          {/* Header con búsqueda y botones */}
          <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between">
            <SearchItems
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <div className="flex items-center gap-2">
              <AddButtonItem />
            </div>
          </div>
          {/* Lista con scroll */}
          <div className="px-6 py-2 flex-1 overflow-y-auto scroll-smooth">
            <ListItems
              products={paginatedProducts}
            />
          </div>

          {/* Paginación */}
          <div className="px-6 py-2 border-t border-gray-200">
            <PaginationItems
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={Math.ceil(filteredProducts.length / 10)}
            />
          </div>
        </div>
      </div>

    </>
  )
}

export default ProductsPage
