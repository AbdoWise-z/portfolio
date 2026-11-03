"use client";
import React, {useRef} from 'react';
import {useSecretContextValues} from "@/components/providers/secret-content-context-provider";
import {cn} from "@/lib/utils";

/** Hides the secret-content mask while the pointer is over its children. */
const SecretIndicatorFade = ({children, className} : {children: React.ReactNode , className?: string}) => {
  const {innerMaskSize, setMaskSize, setEnabled} = useSecretContextValues();
  const previousSize = useRef<number>(60);

  const onMouseEnter = () => {
    previousSize.current = innerMaskSize?.get() ?? 60;
    setMaskSize?.(0);
    setEnabled?.(false);
  };

  const onMouseLeave = () => {
    setMaskSize?.(previousSize.current);
    setEnabled?.(true);
  };

  return (
    <div
      className={cn("block w-fit h-fit", className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

export default SecretIndicatorFade;
