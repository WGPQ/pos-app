import { useProducts } from "@/hooks/useProducts";
import { useProductStore } from "@/store/productStore";
import { Modal } from "../ui/modal";
import Image from "next/image";
import Button from "../ui/button";

const DeleteItem = () => {
  const { removeProduct } = useProducts();
  const showDeleteProduct = useProductStore((state) => state.showDeleteProduct);
  const setShowDeleteProduct = useProductStore((state) => state.setShowDeleteProduct);
  const selectedProduct = useProductStore((state) => state.selectedProduct);
  const setSelectedProduct = useProductStore((state) => state.setSelectedProduct);

  const onClose = () => {
    setShowDeleteProduct(false);
    setSelectedProduct(null);
  }

  const confirmDeleteProduct = () => {
    try {
      if (selectedProduct) {
        removeProduct.mutate(selectedProduct.id);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  return (
    <Modal
      isOpen={showDeleteProduct}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <div className="text-center">
        <div className="relative mx-auto mb-7 h-24 w-24 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
          <Image
            src={selectedProduct?.image || "/placeholder.svg"}
            alt={selectedProduct?.name ?? "Producto"}
            fill
            className="object-cover"
          />
        </div>

        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
          Eliminar Producto
        </h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar <strong>{selectedProduct?.name ?? ''}</strong>? Esta acción no se puede deshacer y
          eliminará permanentemente el producto de tu inventario.
        </p>

        <div className="flex flex-col-reverse items-center justify-center w-full gap-3 mt-7 sm:flex-row">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={confirmDeleteProduct}
            className="w-full bg-error-500 text-white shadow-theme-xs hover:bg-error-600 sm:w-auto"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  )
}


export default DeleteItem
