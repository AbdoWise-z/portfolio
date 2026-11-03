"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {ModalType, useModal} from "@/hooks/use-modal";
import {Loader2} from "lucide-react";

const LoadingModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.LOADING;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open){
        modal.close();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <p>Sending your message ...</p>
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
