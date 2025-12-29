'use client'

import { Plus } from "lucide-react";

import Button from "../ui/button";
import NewModalSale from "./NewModalSale";
import { useState } from "react";
import Snackbar from "../ui/snackbar";

const AddButtonItem = () => {
  const [open, setopen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const onOpenDialog = () => {
    setopen(true);
  };

  const onCloseDialog = () => {
    setopen(false);
  }

  const handleSaleSuccess = () => {
    setopen(false);
    setToastOpen(true);
  };

  return (
    <>
      <Button
        size="sm"
        className="h-9 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        onClick={onOpenDialog}
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Nueva Venta</span>
      </Button>
      {open && <NewModalSale open={open} onClose={onCloseDialog} onSaleSuccess={handleSaleSuccess} />}
      <Snackbar
        open={toastOpen}
        message="Venta exitosa"
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default AddButtonItem;
