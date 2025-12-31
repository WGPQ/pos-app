'use client'

import { Edit, Trash2 } from "lucide-react"
import { Client } from "@/services/clientService";
import { useClientStore } from "@/store/clientStore";
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import DeleteClient from "./DeleteClient";

interface ListClientsProps {
  clients: Client[];
}

const ListClients = ({ clients }: ListClientsProps) => {
  const setShowNewClient = useClientStore((state) => state.setShowNewClient);
  const setSelectedClient = useClientStore((state) => state.setSelectedClient);
  const showDeleteClient = useClientStore((state) => state.showDeleteClient);
  const setShowDeleteClient = useClientStore((state) => state.setShowDeleteClient);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowNewClient(true);
  }

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteClient(true);
  }

  return (
    <>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full border-collapse">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-1/8 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    CI
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/6 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/8 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    Teléfono
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-2/6 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    Dirección
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/8 px-5 py-3 text-sm font-semibold text-gray-600 text-start"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate">
                      {client.ci}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate">
                      {client.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate">
                      {client.email || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate">
                      {client.phone || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate">
                      {client.address || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 w-1/8 truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="dropdown-toggle"
                            aria-label={`Editar ${client.name}`}
                          >
                            <Edit className="h-5 w-5 text-purple-600 hover:text-purple-700 mr-2" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                          Editar
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="dropdown-toggle"
                            aria-label={`Eliminar ${client.name}`}
                          >
                            <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                          Eliminar
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!clients.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No hay clientes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {showDeleteClient && <DeleteClient />}
    </>
  )
}

export default ListClients
