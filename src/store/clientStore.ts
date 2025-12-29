import { Client } from '@/services/clientService'
import { create } from 'zustand'

interface ClientStore {
  clients: Client[]
  showNewClient: boolean
  showDeleteClient: boolean
  selectedClient: Client | null
  loadingClients: boolean
  hasLoadData: boolean
}

interface Actions {
  setClients: (clients: Client[]) => void
  setShowNewClient: (show: boolean) => void
  setShowDeleteClient: (show: boolean) => void
  setSelectedClient: (client: Client | null) => void
  setLoadingClients: (loading: boolean) => void
  setHasLoadData: (loaded: boolean) => void
  addClient: (client: Client) => void
  updateClient: (updatedClient: Client) => void
  removeClient: (id: number) => void
}

export const useClientStore = create<ClientStore & Actions>((set) => ({
  clients: [],
  showNewClient: false,
  showDeleteClient: false,
  selectedClient: null,
  loadingClients: false,
  hasLoadData: false,

  setClients: (clients) => set({ clients }),
  setShowNewClient: (show) => set({ showNewClient: show }),
  setShowDeleteClient: (show) => set({ showDeleteClient: show }),
  setSelectedClient: (client) => set({ selectedClient: client }),
  setLoadingClients: (loading) => set({ loadingClients: loading }),
  setHasLoadData: (loaded) => set({ hasLoadData: loaded }),
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  updateClient: (updatedClient) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      ),
    })),
  removeClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    })),
}))
