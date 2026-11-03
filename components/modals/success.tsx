"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ModalType, useModal } from "@/hooks/use-modal";
import { CheckCircle2 } from "lucide-react";

const SuccessModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.SUCCESS;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) modal.close(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-500" aria-hidden />
          <div>
            <DialogTitle>Message sent</DialogTitle>
            <DialogDescription className="mt-1">
              Thanks for reaching out. I read everything and will get back to you soon.
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
