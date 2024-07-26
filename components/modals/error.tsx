"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {ModalType, useModal} from "@/hooks/use-modal";

const ErrorModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.ERROR;

  return (
    <Dialog open={isOpen} onOpenChange={(open?) => {
      if (!open){
        modal.close();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <p className={"text-red-500"}>Something went wrong.</p>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;