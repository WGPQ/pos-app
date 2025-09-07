'use client'
import { useEffect, useMemo, useState } from 'react'

import SearchItems from '@/components/Item/SearchItems'
import AddButtonItem from '@/components/Item/AddButtonItem'

import { useProductStore } from '@/store/productStore'
import { Product } from '@/services/productService'
import { useProducts } from '@/hooks/useProducts'
import ListItems from '@/components/Item/ListItems'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import Image from 'next/image'
import Badge from '@/components/ui/badge'
import ComponentCard from '@/components/common/ComponentCard'
import Pagination from '@/components/Item/Pagination'


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
  console.log({ productsList: products.length });

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


  interface Order {
    id: number;
    user: {
      image: string;
      name: string;
      role: string;
    };
    projectName: string;
    team: {
      images: string[];
    };
    status: string;
    budget: string;
  }

  const tableData: Order[] = [
    {
      id: 1,
      user: {
        image: "/images/user/user-17.jpg",
        name: "Lindsey Curtis",
        role: "Web Designer",
      },
      projectName: "Agency Website",
      team: {
        images: [
          "/images/user/user-22.jpg",
          "/images/user/user-23.jpg",
          "/images/user/user-24.jpg",
        ],
      },
      budget: "3.9K",
      status: "Active",
    },
    {
      id: 2,
      user: {
        image: "/images/user/user-18.jpg",
        name: "Kaiya George",
        role: "Project Manager",
      },
      projectName: "Technology",
      team: {
        images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
      },
      budget: "24.9K",
      status: "Pending",
    },
    {
      id: 3,
      user: {
        image: "/images/user/user-17.jpg",
        name: "Zain Geidt",
        role: "Content Writing",
      },
      projectName: "Blog Writing",
      team: {
        images: ["/images/user/user-27.jpg"],
      },
      budget: "12.7K",
      status: "Active",
    },
    {
      id: 4,
      user: {
        image: "/images/user/user-20.jpg",
        name: "Abram Schleifer",
        role: "Digital Marketer",
      },
      projectName: "Social Media",
      team: {
        images: [
          "/images/user/user-28.jpg",
          "/images/user/user-29.jpg",
          "/images/user/user-30.jpg",
        ],
      },
      budget: "2.8K",
      status: "Cancel",
    },
    {
      id: 5,
      user: {
        image: "/images/user/user-21.jpg",
        name: "Carla George",
        role: "Front-end Developer",
      },
      projectName: "Website",
      team: {
        images: [
          "/images/user/user-31.jpg",
          "/images/user/user-32.jpg",
          "/images/user/user-33.jpg",
        ],
      },
      budget: "4.5K",
      status: "Active",
    },
  ];

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
      <div className="space-y-6">
        <ComponentCard
          header={
            <div className="pt-2 flex items-center justify-between">
              <SearchItems
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <div className="flex items-center gap-2">
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
            onPageChange={(page) => setCurrentPage(page)}
          />
        </ComponentCard>
      </div>
    </div>
    // <>
    //   <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    //     <h2
    //       className="text-xl font-semibold text-gray-800 dark:text-white/90"
    //       x-text="pageName"
    //     >
    //       {"Inventario (" + products.length + ")"}
    //     </h2>
    //     <div>
    //       <AddButtonItem />
    //     </div>
    //   </div>
    //   <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    //     <div className="max-w-full overflow-x-auto">
    //       <div className="min-w-[1102px]">
    //         <ListItems
    //           products={paginatedProducts}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </>
  )
}

export default ProductsPage
