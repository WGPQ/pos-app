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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer group"
          onClick={() => addToCart(product)}
        >
          <div className="relative aspect-square">
            <div className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-700 shadow-theme-xs">
              Stock: {product.quantity}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 z-10">
              <PlusCircle className="h-10 w-10 text-white" />
            </div>
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <CardContent className="p-3">
            <div>
              <h3 className="font-medium line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground">${product.price.toString()}</p>
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
