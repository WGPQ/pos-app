import Button from '@/components/ui/button'
import { Product } from '@/services/productService';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface SidebarPosProps {
  itemsInCart: Product[];
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
}

const SidebarPos: React.FC<SidebarPosProps> = ({ itemsInCart, removeFromCart, updateQuantity }) => {
  const itemCount = itemsInCart ? itemsInCart.reduce((total, item) => total + item.quantity, 0) : 0;
  const cartTotal = itemsInCart ? itemsInCart.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

  const handleCheckout = () => {
    console.log("Proceed to checkout");
  }

  return (
    <div className="flex w-80 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center text-lg font-semibold">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
        </h2>
        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {itemCount} artículos
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {itemsInCart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="font-medium">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemsInCart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    width={64} height={64}
                    src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="font-medium">${parseFloat((item.price * item.quantity).toString()).toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">${parseFloat(item.price.toString()).toFixed(2)} c/u</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded hover:text-gray-700 h-7 w-7 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4 text-gray-400 hover:text-purple-700 dark:hover:text-gray-300" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded hover:text-gray-700 h-7 w-7 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} >
                        <Plus className="h-4 w-4 text-gray-400 hover:text-purple-700 dark:hover:text-gray-300" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-700 dark:hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between font-medium">
            <p>Total</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
        </div>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg" size="md" disabled={itemsInCart.length === 0} onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  )
}

export default SidebarPos
