"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ModalType, useModal } from "@/hooks/use-modal";
import { Loader2 } from "lucide-react";

const LoadingModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.LOADING;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) modal.close(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" aria-hidden />
          <div>
            <DialogTitle>Sending your message…</DialogTitle>
            <DialogDescription className="mt-1">This usually takes a second.</DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
