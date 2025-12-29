'use client'

import React, { useEffect } from 'react'
import ComponentCard from '@/components/common/ComponentCard'
import AddButtonClient from '@/components/Client/AddButtonClient'
import ListClients from '@/components/Client/ListClients'
import Loading from '@/components/ui/loading'
import { useClients } from '@/hooks/useClients'
import { useClientStore } from '@/store/clientStore'

const ClientsPage = () => {
  const { clientsQuery } = useClients();
  const hasLoadData = useClientStore((state) => state.hasLoadData);
  const loadingClients = useClientStore((state) => state.loadingClients);
  const clients = useClientStore((state) => state.clients);

  useEffect(() => {
    if (!hasLoadData) {
      clientsQuery.refetch();
    }
  }, [hasLoadData, clientsQuery]);

  if (loadingClients) {
    return <Loading message='Cargando clientes...' />
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {"Clientes"}
        </h2>
      </div>
      <div className="space-y-4">
        <ComponentCard
          header={
            <div className="pt-2 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <AddButtonClient />
              </div>
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <ListClients clients={clients} />
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default ClientsPage
