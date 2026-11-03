"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ModalType, useModal } from "@/hooks/use-modal";
import { AlertTriangle } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site";

const ErrorModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.ERROR;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) modal.close(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" aria-hidden />
          <div>
            <DialogTitle>Something went wrong</DialogTitle>
            <DialogDescription className="mt-1">
              The message could not be sent. Please try again, or email me directly at{" "}
              <a className="underline underline-offset-4" href={`mailto:${SOCIAL_LINKS.email}`}>
                {SOCIAL_LINKS.email}
              </a>
              .
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;
