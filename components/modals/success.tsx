"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {ModalType, useModal} from "@/hooks/use-modal";

const SuccessModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.SUCCESS;

  return (
    <Dialog open={isOpen} onOpenChange={(open?) => {
      if (!open){
        modal.close();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <p>Your Message Was Received.</p>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;