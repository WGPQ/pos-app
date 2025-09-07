import { useSidebar } from "@/context/SidebarContext";
import React from "react";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[rgba(0, 7, 52, 0.2)] backdrop-blur-[2px] lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
