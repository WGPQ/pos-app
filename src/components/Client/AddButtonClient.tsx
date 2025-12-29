'use client'

import { Plus } from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import Button from "../ui/button";
import AddModalClient from "./AddModalClient";

const AddButtonClient = () => {
  const showNewClient = useClientStore((state) => state.showNewClient);
  const setShowNewClient = useClientStore((state) => state.setShowNewClient);

  const onOpenDialog = () => {
    setShowNewClient(true);
  };

  return (
    <>
      <Button
        size="sm"
        className="h-9 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        onClick={onOpenDialog}
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Nuevo Cliente</span>
      </Button>
      {showNewClient && <AddModalClient />}
    </>
  );
};

export default AddButtonClient;
