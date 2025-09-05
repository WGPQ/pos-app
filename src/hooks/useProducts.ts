import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/services/productService";
import { useProductStore } from "@/store/productStore";

export function useProducts() {
  const setProducts = useProductStore((state) => state.setProducts);
  const setHasLoadData = useProductStore((state) => state.setHasLoadData);
  const addProductStore = useProductStore((state) => state.addProduct);
  const updateProductStore = useProductStore((state) => state.updateProduct);
  const removeProductStore = useProductStore((state) => state.removeProduct);
  const setLoadingProducts = useProductStore((state) => state.setLoadingProducts);


  const productsQuery = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      setLoadingProducts(true);
      const products = await getProducts();
      const sortedProducts = [...products].sort((a, b) => {
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
      setProducts(sortedProducts);
      setLoadingProducts(false);
      setHasLoadData(true);
      return sortedProducts;
    },
    enabled: false,
  });

  const addProduct = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => addProductStore(newProduct),
  });

  const editProduct = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: (updatedProduct) => updateProductStore(updatedProduct),
  });

  const removeProduct = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, id) => {
      removeProductStore(id);
    },
  });

  return { productsQuery, addProduct, editProduct, removeProduct };
}
