"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {ModalType, useModal} from "@/hooks/use-modal";
import {Box, CircularProgress} from "@mui/material";

const LoadingModal = () => {
  const modal = useModal();
  const isOpen = modal.isOpen && modal.type == ModalType.LOADING;

  return (
    <Dialog open={isOpen} onOpenChange={(open?) => {
      if (!open){
        modal.close();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <p>Sending your message ...</p>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;