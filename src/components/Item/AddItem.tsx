'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@prisma/client'
interface AddItemProps {
    isNewProductOpen: boolean
    selectedProduct: Product | null;
    setIsNewProductOpen: (open: boolean) => void
}
const initialValues = {
    name: "",
    description: "",
    image: "",
    category: "oficina",
    sku: "",
    quantity: 0,
    price: 0,
    cost: 0,
    in_store: true,
};

const AddItem: React.FC<AddItemProps> = ({ isNewProductOpen, setIsNewProductOpen, selectedProduct }) => {
    const { addProduct, editProduct } = useProducts();
    const [newProduct, setNewProduct] = useState(initialValues)
    const onCreate = () => {
        addProduct.mutate({
            name: newProduct.name,
            description: newProduct.description!,
            image: "",
            category: newProduct.category,
            sku: newProduct.sku,
            quantity: newProduct.quantity,
            price: newProduct.price,
            cost: newProduct.cost,
            in_store: true,
        });
    }
    const onUpdate = () => {
        editProduct.mutate({
            id: selectedProduct!.id,
            data: {
                cost: newProduct.cost,
                description: newProduct.description!,
                name: newProduct.name,
                sku: newProduct.sku,
                price: newProduct.price,
                quantity: newProduct.quantity,
            }
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (selectedProduct) {
                onUpdate();
            } else {
                onCreate();
            }
            setNewProduct(initialValues);
            setIsNewProductOpen(false);
        } catch (error) {
            console.error("Error creating product:", error);
        }
    }



    useEffect(() => {
        if (selectedProduct) {
            setNewProduct({
                name: selectedProduct.name,
                description: selectedProduct.description!,
                image: selectedProduct.image!,
                category: selectedProduct.category,
                sku: selectedProduct.sku,
                quantity: selectedProduct.quantity,
                price: +selectedProduct.price,
                cost: +selectedProduct.cost,
                in_store: selectedProduct.in_store,
            });
        } else {
            setNewProduct(initialValues);
        }
        return () => {
            setNewProduct(initialValues);
        }
    }, [selectedProduct])

    return (
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Crea un nuevo producto para tu inventario. Completa toda la información requerida a continuación.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                placeholder="Ingrese el nombre del producto"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={newProduct.category}
                                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CLOTHING">CLOTHING</SelectItem>
                                    <SelectItem value="SHOES">SHOES</SelectItem>
                                    <SelectItem value="BAG">BAG</SelectItem>
                                    <SelectItem value="JEWELRY">JEWELRY</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                placeholder="e.g., ESF-001"
                                value={newProduct.sku}
                                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="variantCount">Costo $ *</Label>
                            <Input
                                id="variantCount"
                                type="number"
                                placeholder="0.00"
                                required
                                value={newProduct.cost}
                                onChange={(e) => setNewProduct({ ...newProduct, cost: +e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio $ *</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0.00"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                placeholder="0.00"
                                value={newProduct.quantity}
                                onChange={(e) => setNewProduct({ ...newProduct, quantity: +e.target.value })}
                                required
                            />
                            {/* <Label htmlFor="status">Status *</Label>
                            <Select
                                value={newProduct.status}
                                onValueChange={(value) => setNewProduct({ ...newProduct, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select> */}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variantDescription">Descripción</Label>
                        <Textarea
                            id="variantDescription"
                            placeholder="ej., varía según: tamaño, color"
                            value={newProduct.description!}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsNewProductOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddItem
