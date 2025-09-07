import React, { useEffect } from 'react'
import { Modal } from '../ui/modal'
import { yupResolver } from "@hookform/resolvers/yup";
import { useProducts } from '@/hooks/useProducts';
import { useProductStore } from '@/store/productStore';
import { useForm } from 'react-hook-form';
import { productSchema } from './validationSchema';
import { Input } from '../ui/input';
import Label from '../form/Label';
import Button from '../ui/button';
import { Textarea } from '../ui/textarea';

interface FormValues {
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
}

const AddModalItem = () => {
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
    <Modal isOpen={showNewProduct} onClose={onClose} className="max-w-[600px] m-4">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" placeholder="Ingrese el nombre del producto" {...register("name")} />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="e.g., ESF-001" {...register("sku")} />
                {errors.sku && <p className="text-red-500">{errors.sku.message}</p>}
              </div>

              <div>
                <Label htmlFor="cost">Costo $ *</Label>
                <Input id="cost" step="0.01" type="number" placeholder="0.00" {...register("cost")} />
                {errors.cost && <p className="text-red-500">{errors.cost.message}</p>}

              </div>

              <div>
                <Label htmlFor="price">Precio $ *</Label>
                <Input id="price" step="0.01" type="number" placeholder="0.00" {...register("price")} />
                {errors.price && <p className="text-red-500">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input id="quantity" type="number" placeholder="0" {...register("quantity")} />
                {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="ej., varía según: tamaño, color" {...register("description")} rows={3} />
                {errors.description && <p className="text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 justify-end">
            <Button size="sm" type='button' variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" type='submit' className='bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddModalItem
