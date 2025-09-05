import { Product } from '@/services/productService'
import { create } from 'zustand'


interface ProductStore {
  products: Product[]
  showNewProduct: boolean
  showDetailsProduct: boolean
  selectedProduct: Product | null
  showDeleteProduct: boolean
  loadingProducts: boolean
  hasLoadData: boolean
}

interface Actions {
  setProducts: (products: Product[]) => void
  setShowNewProduct: (show: boolean) => void
  setShowDetailsProduct: (show: boolean) => void
  setSelectedProduct: (product: Product | null) => void
  setShowDeleteProduct: (show: boolean) => void
  setLoadingProducts: (loading: boolean) => void
  setHasLoadData: (loaded: boolean) => void
  addProduct: (product: Product) => void
  updateProduct: (updatedProduct: Product) => void
  removeProduct: (id: number) => void
}

export const useProductStore = create<ProductStore & Actions>((set) => ({
  products: [],
  showNewProduct: false,
  showDetailsProduct: false,
  selectedProduct: null,
  showDeleteProduct: false,
  loadingProducts: false,
  hasLoadData: false,

  setProducts: (products) => set({ products }),
  setShowNewProduct: (show) => set({ showNewProduct: show }),
  setShowDetailsProduct: (show) => set({ showDetailsProduct: show }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setShowDeleteProduct: (show) => set({ showDeleteProduct: show }),
  setLoadingProducts: (loading) => set({ loadingProducts: loading }),
  setHasLoadData: (loaded) => set({ hasLoadData: loaded }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
}));
