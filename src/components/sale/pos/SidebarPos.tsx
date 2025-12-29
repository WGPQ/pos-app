'use client'

import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/services/productService';
import { Minus, Plus, ShoppingCart, Trash2, UserPlus } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSales } from '@/hooks/useSales';
import { useProductStore } from '@/store/productStore';
import { useClients } from '@/hooks/useClients';
import { useClientStore } from '@/store/clientStore';
import AddModalClient from '@/components/Client/AddModalClient';
import { Client } from '@/services/clientService';

interface SidebarPosProps {
  itemsInCart: Product[];
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  onSaleSuccess?: (receiptNumber: string) => void;
}

const SidebarPos: React.FC<SidebarPosProps> = ({
  itemsInCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  onSaleSuccess,
}) => {
  const { createSale } = useSales();
  const updateProductStore = useProductStore((state) => state.updateProduct);
  const { clientsQuery } = useClients();
  const clients = useClientStore((state) => state.clients);
  const hasLoadClients = useClientStore((state) => state.hasLoadData);
  const showNewClient = useClientStore((state) => state.showNewClient);
  const setShowNewClient = useClientStore((state) => state.setShowNewClient);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const latestClientIdRef = useRef<number | null>(null);
  const itemCount = itemsInCart ? itemsInCart.reduce((total, item) => total + item.quantity, 0) : 0;
  const cartTotal = itemsInCart ? itemsInCart.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

  useEffect(() => {
    if (!hasLoadClients) {
      clientsQuery.refetch();
    }
  }, [hasLoadClients, clientsQuery]);

  useEffect(() => {
    if (!clients.length || isFinalConsumer) return;
    const latestId = clients[0].id;
    if (latestClientIdRef.current && latestId !== latestClientIdRef.current && !selectedClient) {
      const latestClient = clients[0];
      setSelectedClient(latestClient);
      setClientSearch(`${latestClient.ci} - ${latestClient.name}`);
      setIsDropdownOpen(false);
    }
    latestClientIdRef.current = latestId;
  }, [clients, selectedClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => {
      return (
        client.ci.toLowerCase().includes(term) ||
        client.name.toLowerCase().includes(term)
      );
    });
  }, [clients, clientSearch]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(`${client.ci} - ${client.name}`);
    setIsDropdownOpen(false);
    setClientError(null);
  };

  const handleCreateClient = () => {
    setShowNewClient(true);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setClientSearch("");
    setClientError(null);
    setIsDropdownOpen(true);
  };

  const handleCheckout = async () => {
    if (!itemsInCart.length || createSale.isPending) return;
    setStatusMessage(null);
    setStatusType(null);
    if (!isFinalConsumer && !selectedClient) {
      setClientError("Selecciona un cliente para registrar la venta.");
      return;
    }

    try {
      const payload = itemsInCart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const result = await createSale.mutateAsync({
        clientId: selectedClient?.id,
        isFinalConsumer,
        items: payload,
      });
      result.updatedProducts.forEach((product) => {
        updateProductStore(product);
      });
      clearCart();
      if (onSaleSuccess) {
        onSaleSuccess(result.sale.receiptNumber);
        return;
      }
      setStatusType("success");
      setStatusMessage(`Venta registrada. Recibo ${result.sale.receiptNumber}.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo registrar la venta.";
      setStatusType("error");
      setStatusMessage(message);
    }
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

      <div className="border-b p-4" ref={selectorRef}>
        <p className="text-xs font-semibold text-gray-600 mb-2">Cliente</p>
        <label className="mb-3 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={isFinalConsumer}
            onChange={(event) => {
              const checked = event.target.checked;
              setIsFinalConsumer(checked);
              setClientError(null);
              if (checked) {
                setSelectedClient(null);
                setClientSearch("");
                setIsDropdownOpen(false);
              }
            }}
            className="h-4 w-4 rounded border-gray-300 accent-purple-600"
          />
          Consumidor final (sin cliente)
        </label>
        {!isFinalConsumer && (
          <>
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar por CI o nombre..."
                value={clientSearch}
                onChange={(event) => {
                  setClientSearch(event.target.value);
                  setSelectedClient(null);
                  setIsDropdownOpen(true);
                  setClientError(null);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                  <div className="max-h-56 overflow-auto py-1 text-sm">
                    {filteredClients.length ? (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <span className="text-sm font-medium">{client.name}</span>
                          <span className="text-xs text-gray-500">CI: {client.ci}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No hay resultados.
                      </div>
                    )}
                  </div>
                  {filteredClients.length === 0 && clientSearch.trim() !== "" && (
                    <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={handleCreateClient}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 dark:border-gray-700 dark:text-gray-300"
                      >
                        <UserPlus className="h-4 w-4" />
                        Crear nuevo cliente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <span>Seleccionado: {selectedClient.ci} - {selectedClient.name}</span>
                <button
                  type="button"
                  onClick={handleClearClient}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Cambiar
                </button>
              </div>
            )}
            {clientError && (
              <p className="mt-2 text-xs text-red-500">{clientError}</p>
            )}
          </>
        )}
        {isFinalConsumer && (
          <p className="text-xs text-gray-500">Se registrará como consumidor final.</p>
        )}
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
        {statusMessage && (
          <p
            className={`mb-3 text-xs ${
              statusType === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {statusMessage}
          </p>
        )}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
          size="md"
          disabled={itemsInCart.length === 0 || createSale.isPending || (!isFinalConsumer && !selectedClient)}
          onClick={handleCheckout}
        >
          {createSale.isPending ? "Procesando..." : "Checkout"}
        </Button>
      </div>
      {showNewClient && <AddModalClient />}
    </div>
  )
}

export default SidebarPos
