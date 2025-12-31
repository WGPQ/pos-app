import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/services/productService";
import { useProductStore } from "@/store/productStore";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ListItemsPosProps {
  addToCart: (product: Product) => void;
  searchTerm: string;
}

const ListItemsPos = ({ addToCart, searchTerm }: ListItemsPosProps) => {
  const { productsQuery } = useProducts();
  const hasLoadData = useProductStore((state) => state.hasLoadData);
  const loadingProducts = useProductStore((state) => state.loadingProducts);
  const products = useProductStore((state) => state.products);

  useEffect(() => {
    if (!hasLoadData) {
      productsQuery.refetch();
    }
  }, [hasLoadData, productsQuery]);

  if (loadingProducts) {
    return <Loading message='Cargando productos...' />
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) => {
        const haystack = `${product.name} ${product.sku} ${product.description ?? ""}`
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : products;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-theme-sm transition-all duration-200 hover:shadow-theme-lg cursor-pointer group"
          onClick={() => addToCart(product)}
        >
          <div className="relative aspect-[4/3] sm:aspect-square">
            <div className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-700 shadow-theme-xs">
              Stock: {product.quantity}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 z-10">
              <PlusCircle className="h-10 w-10 text-white" />
            </div>
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <CardContent className="p-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">${product.price.toString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}

export default ListItemsPos
