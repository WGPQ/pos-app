'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
interface AddItemProps {
    isNewProductOpen: boolean
    setIsNewProductOpen: (open: boolean) => void
}

const AddItem: React.FC<AddItemProps> = ({ isNewProductOpen, setIsNewProductOpen }) => {
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        sku: "",
        variantCount: "",
        variantDescription: "",
        price: "",
        status: "Active",
    })
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("New product:", newProduct)
        setIsNewProductOpen(false)
        setNewProduct({
            name: "",
            category: "",
            sku: "",
            variantCount: "",
            variantDescription: "",
            price: "",
            status: "Active",
        })
    }
    return (
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Create a new product for your inventory. Fill in all the required information below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter product name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
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
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                placeholder="e.g., TS38790"
                                value={newProduct.sku}
                                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price *</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0.00"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="variantCount">Variant Count</Label>
                            <Input
                                id="variantCount"
                                type="number"
                                placeholder="Number of variants"
                                value={newProduct.variantCount}
                                onChange={(e) => setNewProduct({ ...newProduct, variantCount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
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
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variantDescription">Variant Description</Label>
                        <Textarea
                            id="variantDescription"
                            placeholder="e.g., Varies on: Size, Color"
                            value={newProduct.variantDescription}
                            onChange={(e) => setNewProduct({ ...newProduct, variantDescription: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsNewProductOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Create Product
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddItem
