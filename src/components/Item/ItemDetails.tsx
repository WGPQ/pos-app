import React, { FC } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Product } from '@/app/(admin)/(others-pages)/products/page';
interface ItemDetailsProps {
    isProductDetailsOpen: boolean;
    setIsProductDetailsOpen: (open: boolean) => void;
    selectedProduct: Product | null;
}

const ItemDetails:FC<ItemDetailsProps> = ({ isProductDetailsOpen, setIsProductDetailsOpen, selectedProduct }) => {
    return (
        <Dialog open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                    <DialogDescription>View detailed information about this product.</DialogDescription>
                </DialogHeader>

                {selectedProduct && (
                    <div className="space-y-6">
                        {/* Product Image and Basic Info */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0">
                                <img
                                    src={selectedProduct.image || "/placeholder.svg"}
                                    alt={selectedProduct.name}
                                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
                                    <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-xs">
                                        {selectedProduct.category}
                                    </Badge>
                                    <Badge
                                        variant={selectedProduct.status === "Active" ? "default" : "destructive"}
                                        className={
                                            selectedProduct.status === "Active"
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                        }
                                    >
                                        {selectedProduct.status}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-gray-900">{selectedProduct.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Details Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Product Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Category:</span>
                                        <span className="text-gray-900">{selectedProduct.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">SKU:</span>
                                        <span className="text-gray-900">{selectedProduct.sku}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="text-gray-900">{selectedProduct.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Price:</span>
                                        <span className="text-gray-900 font-medium">{selectedProduct.price}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Variants</h4>
                                <div className="text-sm text-gray-900 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                                    {selectedProduct.variant}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Description</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                This is a high-quality {selectedProduct.category.toLowerCase()} item available in multiple variants.
                                Perfect for customers looking for style and comfort. The product is currently{" "}
                                {selectedProduct.status.toLowerCase()}
                                and ready for purchase.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    Edit Product
                                </Button>
                                <Button variant="outline" size="sm">
                                    Duplicate
                                </Button>
                            </div>
                            <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                                Delete Product
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProductDetailsOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ItemDetails
