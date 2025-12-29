'use client'

import React, { useEffect } from 'react'
import { Modal } from '../ui/modal'
import { yupResolver } from "@hookform/resolvers/yup";
import { useClients } from '@/hooks/useClients';
import { useClientStore } from '@/store/clientStore';
import { useForm } from 'react-hook-form';
import { clientSchema } from './validationSchema';
import { Input } from '../ui/input';
import Label from '../form/Label';
import Button from '../ui/button';
import { SaveIcon } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface FormValues {
  ci: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

const AddModalClient = () => {
  const { addClient, editClient } = useClients();
  const selectedClient = useClientStore((state) => state.selectedClient);
  const setSelectedClient = useClientStore((state) => state.setSelectedClient);
  const showNewClient = useClientStore((state) => state.showNewClient);
  const setShowNewClient = useClientStore((state) => state.setShowNewClient);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      ci: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (selectedClient) {
      reset({
        ci: selectedClient.ci,
        name: selectedClient.name,
        email: selectedClient.email ?? "",
        phone: selectedClient.phone ?? "",
        address: selectedClient.address ?? "",
      });
    } else {
      reset({
        ci: "",
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [selectedClient, reset]);

  const onSubmit = (data: FormValues) => {
    try {
      if (selectedClient) {
        editClient.mutate({
          id: selectedClient.id,
          data,
        });
      } else {
        addClient.mutate(data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const onClose = () => {
    setShowNewClient(false);
    setSelectedClient(null);
    reset();
  };

  return (
    <Modal isOpen={showNewClient} onClose={onClose} className="max-w-[600px] m-4">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedClient ? "Editar Cliente" : "Agregar Nuevo Cliente"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {selectedClient ? "Actualiza los datos del cliente." : "Registra un nuevo cliente en tu base de datos."}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="custom-scrollbar max-h-[420px] overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-1">
                <Label htmlFor="ci">CI *</Label>
                <Input id="ci" placeholder="Ingrese el CI" {...register("ci")} />
                {errors.ci && <p className="text-red-500">{errors.ci.message}</p>}
              </div>

              <div className="col-span-1">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" placeholder="Ingrese el nombre" {...register("name")} />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>

              <div className="col-span-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>

              <div className="col-span-1">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="Número de teléfono" {...register("phone")} />
                {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" rows={3} placeholder="Dirección del cliente" {...register("address")} />
                {errors.address && <p className="text-red-500">{errors.address.message}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 justify-end">
            <Button size="sm" type='button' variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" type='submit'
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

export default AddModalClient
