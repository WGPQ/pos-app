import { FC } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { Product } from "@prisma/client";

interface DeleteItemProps {
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    productToDelete: Product | null;
    confirmDeleteProduct: () => void;
}

const DeleteItem: FC<DeleteItemProps> = ({ isDeleteDialogOpen, setIsDeleteDialogOpen, productToDelete, confirmDeleteProduct }: DeleteItemProps) => {
    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar <strong>{productToDelete?.name ?? ''}</strong>? Esta acción no se puede deshacer y
                        eliminará permanentemente el producto de tu inventario.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDeleteProduct}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteItem
