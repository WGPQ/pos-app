"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import {
  Grid3X3,
  ShoppingCart,
  Tag,
  Users,
  BarChart3,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";

type NavItem = {
  name: string;
  icon: React.ElementType | React.ReactElement;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
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
  return (
    <div className="w-16 bg-gradient-to-b from-purple-600 to-purple-700 border-r border-purple-500/20 flex flex-col items-center py-4 shadow-lg">
      <div className="mb-8">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
          <Grid3X3 className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        {
          navItems.map((item) => {
            const Icon = item.icon as React.ElementType;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link href={item.path!} passHref>
                    <Button variant="ghost" size="icon"
                      className="w-10 h-10 text-purple-200 hover:text-white hover:bg-purple-500/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })
        }
      </nav>
    </div>
  )
};

export default AppSidebar;
