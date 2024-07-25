"use client";

import React, {createContext, useContext, useEffect} from 'react';
import {MotionValue, useMotionValue, useSpring} from "framer-motion";

type SecretContentContextType = {
  innerMaskSize: MotionValue<number> | null,
  MaskSize: MotionValue<number> | null,
  setMaskSize: ((value: number) => void) | null,
};

const SecretContentContext = createContext<SecretContentContextType>({
  innerMaskSize: null,
  MaskSize: null,
  setMaskSize: null,
});

const SecretContentContextProvider = (
  { children }: { children: React.ReactNode }
) => {

  const setMaskSize = (maskSize: number) => {
    innerMaskSize.set(maskSize);
  }
  const innerMaskSize = useMotionValue<number>(60);
  const MaskSize  = useSpring(innerMaskSize , { stiffness: 1800, damping: 150 });

  return (
    <SecretContentContext.Provider value={{
      innerMaskSize,
      MaskSize,
      setMaskSize
    }}>
      {children}
    </SecretContentContext.Provider>
  );
};

export const useSecretContextValues = () => useContext(SecretContentContext);

export default SecretContentContextProvider;