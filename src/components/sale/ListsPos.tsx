"use client"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table"
import Badge from "../ui/badge";
import { Eye } from "lucide-react";
import IconButton from "../ui/icon-button";

interface Order {
  id: number;
  date: string;
  receiptNumber: string;
  amount: string;
  status: string;
}

const tableData: Order[] = [
  { id: 1, date: '2024-10-01', receiptNumber: 'REC-1001', amount: '$150.00', status: 'Completed' },
  { id: 2, date: '2024-10-02', receiptNumber: 'REC-1002', amount: '$200.00', status: 'Pending' },
  { id: 3, date: '2024-10-03', receiptNumber: 'REC-1003', amount: '$350.00', status: 'Cancelled' },
  { id: 4, date: '2024-10-04', receiptNumber: 'REC-1004', amount: '$400.00', status: 'Completed' },
  { id: 5, date: '2024-10-05', receiptNumber: 'REC-1005', amount: '$250.00', status: 'Pending' },
  { id: 6, date: '2024-10-06', receiptNumber: 'REC-1006', amount: '$300.00', status: 'Completed' },
  { id: 7, date: '2024-10-07', receiptNumber: 'REC-1007', amount: '$450.00', status: 'Cancelled' },
  { id: 8, date: '2024-10-08', receiptNumber: 'REC-1008', amount: '$500.00', status: 'Completed' },
  { id: 9, date: '2024-10-09', receiptNumber: 'REC-1009', amount: '$600.00', status: 'Pending' },
  { id: 10, date: '2024-10-10', receiptNumber: 'REC-1010', amount: '$700.00', status: 'Completed' },
];

const ListsPos = () => {

  const handleViewOrder = (orderId: number) => {
    // Implement view order logic here
    console.log("View order:", orderId);
  }
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[1102px]">
        <div className="overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  N° Recibo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fecha
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="w-1/8 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.receiptNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.date}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Completed"
                          ? "success"
                          : order.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 w-1/8 truncate">
                      <IconButton
                        icon={<Eye className="h-5 w-5 text-gray-400 hover:text-purple-700 dark:hover:text-gray-300 mr-2" />}
                        onClick={() => { handleViewOrder(order.id) }}
                      />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ListsPos
