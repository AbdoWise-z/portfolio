"use client";
import React, {useEffect, useRef, useState} from 'react';
import {useSecretContextValues} from "@/components/providers/secret-content-context-provider";
import {cn} from "@/lib/utils";

const SecretIndicatorFade = ({children, className} : {children: React.ReactNode , className?: string}) => {
  const ref = useRef<HTMLDivElement>(null);
  const contextData = useSecretContextValues();

  const [oldSize, setSize] = useState<number>(0);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.onmouseenter = (e) => {
        setSize(contextData.innerMaskSize!.get());
        contextData.setMaskSize!(0);
        contextData.setEnabled!(false);
    }

    ref.current.onmouseleave = (e) => {
        contextData.setMaskSize!(oldSize);
        contextData.setEnabled!(true);
    }
  }, [contextData, oldSize]);


  return (
    <div ref={ref} className={cn("block w-fit h-fit", className)}>
      {children}
    </div>
  );
};

export default SecretIndicatorFade;