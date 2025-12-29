'use client'
import { useEffect, useMemo, useState } from 'react'

import SearchItems from '@/components/Item/SearchItems'
import AddButtonItem from '@/components/Item/AddButtonItem'
import ExportItems from '@/components/Item/ExportItems'
import ImportItems from '@/components/Item/ImportItems'

import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/services/productService'
import { useProductStore } from '@/store/productStore'

import Loading from '@/components/ui/loading'
import ListItems from '@/components/Item/ListItems'
import Pagination from '@/components/Item/Pagination'
import ComponentCard from '@/components/common/ComponentCard'


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

const ProductsPage = () => {
  const { productsQuery } = useProducts();
  const hasLoadData = useProductStore((state) => state.hasLoadData);
  const loadingProducts = useProductStore((state) => state.loadingProducts);
  const products = useProductStore((state) => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const availableHeight = window.innerHeight - 300;
      const rowHeight = 88;
      const maxItems = Math.floor(availableHeight / rowHeight);
      setItemsPerPage(maxItems > 3 ? maxItems : 3);
    };

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  const filteredProducts = useMemo(() => {
    return applyFilters(products, searchTerm.toLowerCase());
  }, [searchTerm, products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredProducts, itemsPerPage]);


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
  }, [filteredProducts, currentPage, itemsPerPage]);

  if (loadingProducts) {
    return <Loading message='Cargando productos...' />
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {"Inventario"}
        </h2>
      </div>
      <div className="space-y-4">
        <ComponentCard
          header={
            <div className="pt-2 flex items-center justify-between">
              <SearchItems
                setSearchTerm={setSearchTerm}
              />
              <div className="flex items-start gap-2">
                <ExportItems items={products} />
                <ImportItems items={products} />
                <AddButtonItem />
              </div>
            </div>
          }
        >

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <ListItems
                  products={paginatedProducts}
                />
              </div>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default ProductsPage
