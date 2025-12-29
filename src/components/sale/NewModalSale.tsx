import { Modal } from "../ui/modal";
import ListItemsPos from "./pos/ListItemsPos";
import SidebarPos from "./pos/SidebarPos";
import SearchItems from "../Item/SearchItems";
import { useState } from "react";
import { Product } from "@/services/productService";

interface NewModalSaleProps {
  open: boolean;
  onClose: () => void;
  onSaleSuccess?: (receiptNumber: string) => void;
}

const NewModalSale = ({ open, onClose, onSaleSuccess }: NewModalSaleProps) => {
  const [itemsToCar, setItemsToCar] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  const removeFromCart = (id: number) => {
    setItemsToCar((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  const clearCart = () => {
    setItemsToCar([]);
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItemsToCar((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }

  const addToCart = (product: Product) => {
    setItemsToCar((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }

  const handleSaleSuccess = (receiptNumber: string) => {
    onClose();
    onSaleSuccess?.(receiptNumber);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isFullscreen={true}
      showCloseButton={true}
    >
      <div className="flex  overflow-x-hidden overflow-y-auto bg-white dark:bg-gray-900 lg:p-10">
        <main className="flex-1 flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
          <div className="sticky top-0 z-10 bg-background p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <div className="flex items-center gap-4">
                <SearchItems setSearchTerm={setSearchTerm} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <ListItemsPos addToCart={addToCart} searchTerm={searchTerm} />
          </div>
        </main>

        <SidebarPos
          itemsInCart={itemsToCar}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          onSaleSuccess={handleSaleSuccess}
        />
      </div>
    </Modal>
  )
}

export default NewModalSale
