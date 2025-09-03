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
    name: "Home",
    path: "/",
  },
  {
    icon: Grid3X3,
    name: "Products",
    path: "/products",
  },
  {
    icon: ShoppingCart,
    name: "Orders",
    path: "/orders",
  },
  {
    icon: Tag,
    name: "Tags",
    path: "/tags",
  },
  {
    icon: Users,
    name: "Users",
    path: "/users",
  },
  {
    icon: BarChart3,
    name: "Reports",
    path: "/reports",
  },
];


const AppSidebar: React.FC = () => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Grid3X3 className="w-5 h-5 text-white" />
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
                    <Button variant="ghost" size="icon" className="w-10 h-10 text-gray-400 hover:text-gray-600">
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
