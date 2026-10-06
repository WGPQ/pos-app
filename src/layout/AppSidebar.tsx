"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import BusinessBrand, { BusinessBrandData } from "@/components/business/BusinessBrand";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { usePermissions } from "@/context/PermissionContext";
import {
  Box,
  Users,
  BarChart3,
  Calculator,
  CircleDollarSign,
  HomeIcon,
  ShoppingBag,
  Settings,
  Tags,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ElementType | React.ReactElement;
  path: string;
  permission?: string;
};

const navItems: NavItem[] = [
  { icon: Tags, name: "Categorías", path: "/categories", permission: "business.settings.view" },
  { icon: Settings, name: "Configuración", path: "/settings", permission: "business.settings.view" },
  {
    icon: Users,
    name: "Usuarios",
    path: "/users",
    permission: "user.view",
  },
  {
    icon: Calculator,
    name: "Punto de venta",
    path: "/sales",
    permission: "sale.create",
  },
  {
    icon: HomeIcon,
    name: "Inicio",
    path: "/",
    permission: "dashboard.view",
  },
  {
    icon: Box,
    name: "Inventario",
    path: "/products",
    permission: "product.view",
  },
  {
    icon: ShoppingBag,
    name: "Ventas",
    path: "/sales",
    permission: "sale.view",
  },
  {
    icon: Users,
    name: "Clientes",
    path: "/clients",
    permission: "customer.view",
  },
  {
    icon: BarChart3,
    name: "Reportes",
    path: "/reports",
    permission: "report.view",
  },
  {
    icon: CircleDollarSign,
    name: "Caja registradora",
    path: "/cash-register",
    permission: "cash.view",
  },
];

const AppSidebar: React.FC<{ business: BusinessBrandData }> = ({ business }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { can, loading } = usePermissions();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.filter((nav) => !loading && (!nav.permission || can(nav.permission))).map((nav) => {
        const Icon = nav.icon as React.ElementType;
        return (
          <li key={nav.name}>
            <Link
              href={nav.path}
              className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
            >
              <span
                className={`${isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                <Icon />
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  );

  const isActive = useCallback((path: string) => path === pathname, [pathname]);


  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/" className="min-w-0">
          <BusinessBrand business={business} compact={!(isExpanded || isHovered || isMobileOpen)} />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                Menu
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
