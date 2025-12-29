import React, { useEffect, useRef, useState } from 'react'
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
import { Camera, Loader2, SaveIcon } from 'lucide-react';
import Image from 'next/image';
import { useUpload } from '@/hooks/useUpload';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface FormValues {
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
}

const AddModalItem = () => {
  const { uploadImage } = useUpload();
  const { addProduct, editProduct } = useProducts();
  const selectedProduct = useProductStore((state) => state.selectedProduct);
  const setSelectedProduct = useProductStore((state) => state.setSelectedProduct);
  const showNewProduct = useProductStore((state) => state.showNewProduct);
  const setShowNewProduct = useProductStore((state) => state.setShowNewProduct);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

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
      const existingImage = selectedProduct.image ?? "";
      clearObjectUrl();
      setPreview(existingImage);
      setImageUrl(existingImage);
      setUrlInput(existingImage);
      setUploadError(null);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      reset({
        name: "",
        description: "",
        sku: "",
        quantity: 0,
        price: 0,
        cost: 0,
      });
      clearObjectUrl();
      setPreview("");
      setImageUrl("");
      setUrlInput("");
      setUploadError(null);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedProduct, reset]);

  useEffect(() => {
    return () => {
      clearObjectUrl();
    };
  }, []);

  const onSubmit = (data: FormValues) => {
    try {
      const resolvedImage = imageUrl.trim();
      if (selectedProduct) {
        editProduct.mutate({
          id: selectedProduct.id,
          data: { ...data, image: resolvedImage },
        });
      } else {
        addProduct.mutate({ ...data, image: resolvedImage, category: "oficina", in_store: true });
      }
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const onClose = () => {
    setShowNewProduct(false);
    setSelectedProduct(null);
    reset();
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setUploadError(null);
    clearObjectUrl();
    const objectUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadImage(selectedFile);
      clearObjectUrl();
      setImageUrl(uploadedUrl);
      setPreview(uploadedUrl);
      setUrlInput(uploadedUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("No se pudo subir la imagen. Intenta nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    const nextUrl = urlInput.trim();
    setUploadError(null);
    clearObjectUrl();
    setImageUrl(nextUrl);
    setPreview(nextUrl);
  };

  return (
    <Modal isOpen={showNewProduct} onClose={onClose} className="max-w-[600px] m-4">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {selectedProduct ? "Actualiza los detalles del producto." : "Crea un nuevo producto para tu inventario. Completa toda la información requerida a continuación."}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="w-full sm:w-[200px]">
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Vista previa de imagen"
                          fill
                          sizes="(max-width: 640px) 70vw, 200px"
                          className={preview ? "object-cover" : "object-contain"}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Subiendo...
                            </div>
                          </div>
                        )}
                        <div className="absolute right-2 top-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={handlePickImage}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white"
                                aria-label="Editar imagen"
                              >
                                <Camera className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={6}>
                              Editar imagen
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Imagen del producto
                        </p>
                        <p className="text-xs text-gray-500">
                          Sube una imagen o pega una URL. Se usa como portada en el catálogo.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            type="url"
                            placeholder="https://...jpg"
                            value={urlInput}
                            onChange={(event) => setUrlInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleApplyUrl();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={handleApplyUrl}
                            disabled={isUploading}
                            className="whitespace-nowrap"
                          >
                            Usar URL
                          </Button>
                        </div>
                        {uploadError && (
                          <p className="text-xs text-red-500">{uploadError}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Formatos recomendados: JPG, PNG o WEBP.
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handlePickImage}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Seleccionar desde tu dispositivo
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" placeholder="Ingrese el nombre del producto" {...register("name")} />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>

              <div className='col-span-1'>
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="e.g., ESF-001" {...register("sku")} />
                {errors.sku && <p className="text-red-500">{errors.sku.message}</p>}
              </div>

              <div className='col-span-1'>
                <Label htmlFor="cost">Costo $ *</Label>
                <Input id="cost" step="0.01" type="number" placeholder="0.00" {...register("cost")} />
                {errors.cost && <p className="text-red-500">{errors.cost.message}</p>}

              </div>

              <div className='col-span-1'>
                <Label htmlFor="price">Precio $ *</Label>
                <Input id="price" step="0.01" type="number" placeholder="0.00" {...register("price")} />
                {errors.price && <p className="text-red-500">{errors.price.message}</p>}
              </div>
              <div className='col-span-1'>
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
              Cancelar
            </Button>
            <Button size="sm" type='submit'
              disabled={isUploading}
              startIcon={
                <SaveIcon className='h-4 w-4' />
              }
              className='bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddModalItem
