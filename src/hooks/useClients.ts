import { useQuery, useMutation } from "@tanstack/react-query";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
  Client,
} from "@/services/clientService";
import { useClientStore } from "@/store/clientStore";

export function useClients() {
  const setClients = useClientStore((state) => state.setClients);
  const setHasLoadData = useClientStore((state) => state.setHasLoadData);
  const addClientStore = useClientStore((state) => state.addClient);
  const updateClientStore = useClientStore((state) => state.updateClient);
  const removeClientStore = useClientStore((state) => state.removeClient);
  const setLoadingClients = useClientStore((state) => state.setLoadingClients);

  const clientsQuery = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      setLoadingClients(true);
      const clients = await getClients();
      setClients(clients);
      setLoadingClients(false);
      setHasLoadData(true);
      return clients;
    },
    enabled: false,
  });

  const addClient = useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => addClientStore(newClient),
  });

  const editClient = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) =>
      updateClient(id, data),
    onSuccess: (updatedClient) => updateClientStore(updatedClient),
  });

  const removeClient = useMutation({
    mutationFn: deleteClient,
    onSuccess: (_, id) => {
      removeClientStore(id);
    },
  });

  return { clientsQuery, addClient, editClient, removeClient };
}
