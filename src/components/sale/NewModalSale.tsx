import { Modal } from "../ui/modal";
import ListItemsPos from "./pos/ListItemsPos";
import SidebarPos from "./pos/SidebarPos";
import SearchItems from "../Item/SearchItems";
import { useMemo, useState } from "react";
import { Product } from "@/services/productService";
import Button from "../ui/button";
import { ShoppingCart } from "lucide-react";

interface NewModalSaleProps {
  open: boolean;
  onClose: () => void;
  onSaleSuccess?: (receiptNumber: string) => void;
}

const NewModalSale = ({ open, onClose, onSaleSuccess }: NewModalSaleProps) => {
  const [itemsToCar, setItemsToCar] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);


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

  const itemCount = useMemo(
    () => itemsToCar.reduce((total, item) => total + item.quantity, 0),
    [itemsToCar]
  );

  const cartTotal = useMemo(
    () => itemsToCar.reduce((total, item) => total + item.price * item.quantity, 0),
    [itemsToCar]
  );

  const handleSaleSuccess = (receiptNumber: string) => {
    onClose();
    setShowCart(false);
    onSaleSuccess?.(receiptNumber);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isFullscreen={true}
      showCloseButton={true}
    >
      <div className="flex flex-col overflow-x-hidden overflow-y-auto bg-white dark:bg-gray-900 lg:flex-row lg:p-10">
        <main className="flex-1 flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
          <div className="sticky top-0 z-10 bg-background p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Punto de Venta</h1>
              <div className="flex items-center gap-4">
                <SearchItems setSearchTerm={setSearchTerm} value={searchTerm} />
              </div>
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-auto p-4">
            <ListItemsPos addToCart={addToCart} searchTerm={searchTerm} />
          </div>
        </main>

        <SidebarPos
          itemsInCart={itemsToCar}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          onSaleSuccess={handleSaleSuccess}
          className="hidden lg:flex"
        />
      </div>
      {!showCart && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <Button
          size="md"
          className="w-full justify-between bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
          onClick={() => setShowCart(true)}
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ver carrito
          </span>
          <span className="text-sm font-semibold">
            {itemCount} · ${cartTotal.toFixed(2)}
          </span>
        </Button>
      </div>
      )}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} className="max-w-[520px] m-4">
        <SidebarPos
          itemsInCart={itemsToCar}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          onSaleSuccess={handleSaleSuccess}
          className="w-full border-l-0 rounded-3xl"
        />
      </Modal>
    </Modal>
  )
}

export default NewModalSale
