'use client';
import React, { useEffect, useMemo } from 'react'
import { Users, Package, ShoppingCart, Wallet } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useClientStore } from '@/store/clientStore'
import { useProducts } from '@/hooks/useProducts'
import { useProductStore } from '@/store/productStore'
import { useSales } from '@/hooks/useSales'
import Badge from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'

const HomePage = () => {
  const { clientsQuery } = useClients();
  const { productsQuery } = useProducts();
  const { salesQuery } = useSales();
  const clients = useClientStore((state) => state.clients);
  const hasLoadClients = useClientStore((state) => state.hasLoadData);
  const loadingClients = useClientStore((state) => state.loadingClients);
  const products = useProductStore((state) => state.products);
  const hasLoadProducts = useProductStore((state) => state.hasLoadData);
  const loadingProducts = useProductStore((state) => state.loadingProducts);
  const sales = salesQuery.data ?? [];

  useEffect(() => {
    if (!hasLoadClients) {
      clientsQuery.refetch();
    }
  }, [hasLoadClients, clientsQuery]);

  useEffect(() => {
    if (!hasLoadProducts) {
      productsQuery.refetch();
    }
  }, [hasLoadProducts, productsQuery]);

  const completedSales = useMemo(
    () => sales.filter((sale) => sale.status === "Completed"),
    [sales]
  );

  const totalBalance = useMemo(
    () =>
      completedSales.reduce((acc, sale) => acc + Number(sale.total), 0),
    [completedSales]
  );

  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number }>();
    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.productName;
        const current = productMap.get(key);
        const nextQty = (current?.quantity ?? 0) + Number(item.quantity);
        productMap.set(key, { name: item.productName, quantity: nextQty });
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [completedSales]);

  const totalTopQuantity = useMemo(
    () => topProducts.reduce((acc, item) => acc + item.quantity, 0),
    [topProducts]
  );

  const donutColors = ["#5b8ff9", "#61d9a5", "#f6bd16", "#f28e9c", "#9270ca"];
  const donutSegments = topProducts.map((item, index) => {
    const percent = totalTopQuantity
      ? (item.quantity / totalTopQuantity) * 100
      : 0;
    return {
      ...item,
      percent,
      color: donutColors[index % donutColors.length],
    };
  });

  const donutGradient = useMemo(() => {
    if (!donutSegments.length || totalTopQuantity === 0) {
      return "conic-gradient(#e5e7eb 0 100%)";
    }
    let current = 0;
    const stops = donutSegments.map((segment) => {
      const start = current;
      const end = current + segment.percent;
      current = end;
      return `${segment.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${stops.join(",")})`;
  }, [donutSegments, totalTopQuantity]);

  const recentSales = useMemo(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [sales]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const stats = [
    {
      id: "clients",
      label: "Clientes totales",
      value: loadingClients ? "—" : clients.length.toString(),
      icon: Users,
      accent: "bg-blue-50 text-blue-600",
      ring: "ring-blue-100/80",
    },
    {
      id: "products",
      label: "Productos totales",
      value: loadingProducts ? "—" : products.length.toString(),
      icon: Package,
      accent: "bg-purple-50 text-purple-600",
      ring: "ring-purple-100/80",
    },
    {
      id: "sales",
      label: "Ventas totales",
      value: salesQuery.isLoading ? "—" : sales.length.toString(),
      icon: ShoppingCart,
      accent: "bg-emerald-50 text-emerald-600",
      ring: "ring-emerald-100/80",
    },
    {
      id: "balance",
      label: "Balance",
      value: salesQuery.isLoading ? "—" : formatCurrency(totalBalance),
      icon: Wallet,
      accent: "bg-amber-50 text-amber-600",
      ring: "ring-amber-100/80",
    },
  ];

  return (
     <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {"Inicio"}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-theme-lg"
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 ${stat.accent} ${stat.ring}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top 5 productos</h3>
              <p className="text-sm text-gray-500">Más vendidos</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Resumen</span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="flex items-center justify-center">
              <div
                className="relative h-56 w-56 rounded-full"
                style={{ background: donutGradient }}
              >
                <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-xs uppercase text-gray-400">Total</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    {totalTopQuantity || 0}
                  </span>
                  <span className="text-xs text-gray-400">unidades</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {donutSegments.length ? (
                donutSegments.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} unidades
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Sin ventas registradas.</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recibos recientes</h3>
              <p className="text-sm text-gray-500">Últimas ventas</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Hoy</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
            <Table>
              <TableHeader className="border-b border-gray-100">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-start text-sm font-semibold text-gray-600">
                    Recibo
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-start text-sm font-semibold text-gray-600">
                    Cliente
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-start text-sm font-semibold text-gray-600">
                    Total
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-start text-sm font-semibold text-gray-600">
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700">
                      {sale.receiptNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700">
                      {sale.client ? sale.client.name : "Consumidor final"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700">
                      {formatCurrency(Number(sale.total))}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700">
                      <Badge
                        size="sm"
                        color={sale.status === "Completed" ? "success" : "error"}
                      >
                        {sale.status === "Completed" ? "Completado" : "Anulado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!recentSales.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-4 py-6 text-center text-theme-sm text-gray-500"
                    >
                      No hay recibos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
