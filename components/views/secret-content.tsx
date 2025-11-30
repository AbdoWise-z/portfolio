"use client";

import React, {useEffect, useRef} from 'react';
import {MotionValue, useMotionTemplate, motion, useMotionValue, useTransform} from "framer-motion";
import {cn} from "@/lib/utils";
import {useMaskPosition} from "@/hooks/use-mask-position";
import {useSecretContextValues} from "@/components/providers/secret-content-context-provider";

const SecretContent = (
  {
    children,
    secret,
    maskSize,
    className,
    innerClassName,
    maskWidth,
    focusMaskWidth,
  } : {
    children: React.ReactNode;
    secret: React.ReactNode;
    maskX?: MotionValue<number>,
    maskY?: MotionValue<number>,
    maskSize?: MotionValue<number>,
    className?: string,
    innerClassName?: string,
    maskWidth?: number;
    focusMaskWidth?: number;
  }
) => {
  const ref = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  const {enabled} = useSecretContextValues();
  const mask1 = useMaskPosition(ref1);
  const maskPosition1 = useMotionTemplate`center, ${mask1.transformedX}px ${mask1.transformedY}px`;
  const maskSizeT1    = useMotionTemplate`contain, ${maskSize ?? mask1.contextData.MaskSize ?? 50}px ${maskSize ?? mask1.contextData.MaskSize ?? 50}px`;

  const mask2 = useMaskPosition(ref2);
  const maskPosition2 = useMotionTemplate`center, ${mask2.transformedX}px ${mask2.transformedY}px`;
  const maskSizeT2    = useMotionTemplate`contain, ${maskSize ?? mask2.contextData.MaskSize ?? 50}px ${maskSize ?? mask2.contextData.MaskSize ?? 50}px`;

  useEffect(() => {
    if (!ref.current) return;
   
    ref.current.onmouseenter = (e) => {
      if (mask1.contextData.setMaskSize && enabled) {
        mask1.contextData.setMaskSize(focusMaskWidth ?? 160);
      }
    }

    ref.current.onmouseleave = (e) => {
      if (mask1.contextData.setMaskSize && enabled){
        mask1.contextData.setMaskSize(maskWidth ?? 60);
      }
    }
  }, [mask1.contextData, focusMaskWidth, maskWidth, enabled]);

  return (
    <div ref={ref} className={cn("flex w-fit h-fit", className)}>
      <motion.div
        ref={ref1}
        style={{
          display: "block",
          position: "absolute",
          maskImage: "linear-gradient(white, white), url(\"/circle.svg\")",
          maskComposite: "intersect",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT1,
          maskPosition: maskPosition1,
        }}

        className={innerClassName}
      >
        {secret}
      </motion.div>

      <motion.div
        ref={ref2}
        style={{
          position: "relative",
          display: "block",
          maskImage: "linear-gradient(white, white), url(\"/circle.svg\")",
          maskComposite: "exclude",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT2,
          maskPosition: maskPosition2,
        }}
        className={innerClassName}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SecretContent;