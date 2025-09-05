import { useProducts } from "@/hooks/useProducts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { useProductStore } from "@/store/productStore";

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
    <AlertDialog open={showDeleteProduct} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar <strong>{selectedProduct?.name ?? ''}</strong>? Esta acción no se puede deshacer y
            eliminará permanentemente el producto de tu inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteProduct}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export default DeleteItem
