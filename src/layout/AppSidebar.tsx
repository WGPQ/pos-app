"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  Grid3X3,
  ShoppingCart,
  Tag,
  Users,
  BarChart3,
  HomeIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ElementType | React.ReactElement;
  path: string;
};

const navItems: NavItem[] = [
  {
    icon: HomeIcon,
    name: "Inicio",
    path: "/",
  },
  {
    icon: Grid3X3,
    name: "Inventario",
    path: "/products",
  },
  {
    icon: ShoppingCart,
    name: "Ordenes",
    path: "/orders",
  },
  {
    icon: Tag,
    name: "Etiquetas",
    path: "/tags",
  },
  {
    icon: Users,
    name: "Usuarios",
    path: "/users",
  },
  {
    icon: BarChart3,
    name: "Reportes",
    path: "/reports",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => {
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
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
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
