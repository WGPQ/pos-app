import { useProductStore } from '@/store/productStore'
import Image from 'next/image'
import { Modal } from '../ui/modal';
import Badge from '../ui/badge';

const ItemDetails = () => {
  const showDetailsProduct = useProductStore((state) => state.showDetailsProduct);
  const setShowDetailsProduct = useProductStore((state) => state.setShowDetailsProduct);
  const selectedProduct = useProductStore((state) => state.selectedProduct);
  const setSelectedProduct = useProductStore((state) => state.setSelectedProduct);

  const onCloseDetails = () => {
    setShowDetailsProduct(false);
    setSelectedProduct(null);
  }
  return (
    <Modal isOpen={showDetailsProduct} onClose={onCloseDetails} className="max-w-[600px] m-4">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Detalle de Producto
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Ver información detallada sobre este producto.
          </p>
        </div>

        {selectedProduct && (
          <div className="space-y-6 mt-4">
            {/* Product Image and Basic Info */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Image
                  alt={selectedProduct.name}
                  width={140}
                  height={140}
                  src={selectedProduct.image || "/placeholder.svg"}
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* <Badge variant="outline" className="text-xs">
                                    {selectedProduct.category}
                                </Badge> */}
                  <Badge
                    size="md"
                    color={selectedProduct.in_store ? 'success' : 'error'}
                  >
                    {selectedProduct.in_store ? "En tienda" : "Agotado"}
                  </Badge>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">${parseFloat(selectedProduct.price.toString()).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Información del Producto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">SKU:</span>
                    <span className="text-gray-900">{selectedProduct.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cantidad:</span>
                    <span className="text-gray-900">{selectedProduct.quantity.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Costo:</span>
                    <span className="text-gray-900 font-medium">${parseFloat(selectedProduct.cost.toString()).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Descripción</h4>
                <p className="text-sm text-gray-500">
                  {selectedProduct.description || "No hay descripción disponible para este producto."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 px-2">
          <button
            onClick={onCloseDetails}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ItemDetails
