
'use client'
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useProducts } from "@/hooks/useProducts";
import { productSchema } from "./validationSchema";
import { useProductStore } from "@/store/productStore";

interface FormValues {
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
}

const AddDialogItem = () => {
  const { addProduct, editProduct } = useProducts();
  const selectedProduct = useProductStore((state) => state.selectedProduct);
  const showNewProduct = useProductStore((state) => state.showNewProduct);
  const setShowNewProduct = useProductStore((state) => state.setShowNewProduct);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      quantity: 0,
      price: 0,
      cost: 0,
    },
  });

  useEffect(() => {
    if (selectedProduct) {
      reset({
        name: selectedProduct.name,
        description: selectedProduct.description!,
        sku: selectedProduct.sku,
        quantity: selectedProduct.quantity,
        price: +selectedProduct.price,
        cost: +selectedProduct.cost,
      });
    } else {
      reset({
        name: "",
        description: "",
        sku: "",
        quantity: 0,
        price: 0,
        cost: 0,
      });
    }
  }, [selectedProduct, reset]);

  const onSubmit = (data: FormValues) => {
    try {
      if (selectedProduct) {
        editProduct.mutate({
          id: selectedProduct.id,
          data,
        });
      } else {
        addProduct.mutate({ ...data, image: "", category: "oficina", in_store: true });
      }
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };


  const onClose = () => {
    setShowNewProduct(false);
    reset();
  };

  return (
    <Dialog open={showNewProduct} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Crea un nuevo producto para tu inventario. Completa toda la información requerida a continuación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Ingrese el nombre del producto" {...register("name")} />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="e.g., ESF-001" {...register("sku")} />
              {errors.sku && <p className="text-red-500">{errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo $ *</Label>
              <Input id="cost" step="0.01" type="number" placeholder="0.00" {...register("cost")} />
              {errors.cost && <p className="text-red-500">{errors.cost.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio $ *</Label>
              <Input id="price" step="0.01" type="number" placeholder="0.00" {...register("price")} />
              {errors.price && <p className="text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input id="quantity" type="number" placeholder="0" {...register("quantity")} />
              {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" placeholder="ej., varía según: tamaño, color" {...register("description")} rows={2} />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDialogItem;
