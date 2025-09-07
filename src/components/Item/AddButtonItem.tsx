'use client'

import { Plus } from "lucide-react";

import { useProductStore } from "@/store/productStore";
import Button from "../ui/button";
import AddModalItem from "./AddModalItem";

const AddButtonItem = () => {
  const showNewProduct = useProductStore((state) => state.showNewProduct);
  const setShowNewProduct = useProductStore((state) => state.setShowNewProduct);

  const onOpenDialog = () => {
    setShowNewProduct(true);
  };

  return (
    <>
      <Button
        size="sm"
        className="h-9 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        onClick={onOpenDialog}
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Nuevo Producto</span>
      </Button>
      {showNewProduct && <AddModalItem />}
    </>
  );
};

export default AddButtonItem;
