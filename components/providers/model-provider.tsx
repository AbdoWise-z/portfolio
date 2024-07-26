"use client";

import React, {useEffect} from 'react';
import LoadingModal from "@/components/modals/loading-modal";
import SuccessModal from "@/components/modals/success";
import ErrorModal from "@/components/modals/error";

const ModelProvider = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <LoadingModal />
      <SuccessModal />
      <ErrorModal />
    </>
  );
};

export default ModelProvider;