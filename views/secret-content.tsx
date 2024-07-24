"use client";

import React, {useEffect, useRef} from 'react';
import {MotionValue, useMotionTemplate, motion, useMotionValue, useTransform} from "framer-motion";
import {cn} from "@/lib/utils";
import {useMaskPosition} from "@/hooks/use-mask-position";

const SecretContent = (
  {
    children,
    secret,
    maskSize,
    className,
    maskWidth,
    focusMaskWidth,
  } : {
    children: React.ReactNode;
    secret: React.ReactNode;
    maskX?: MotionValue<number>,
    maskY?: MotionValue<number>,
    maskSize?: MotionValue<number>,
    className?: string,
    maskWidth?: number;
    focusMaskWidth?: number;
  }
) => {
  const ref = useRef<HTMLDivElement>(null);

  const {transformedX , transformedY, contextData} = useMaskPosition(ref);
  const maskPosition = useMotionTemplate`center, ${transformedX}px ${transformedY}px`;
  const maskSizeT    = useMotionTemplate`contain, ${maskSize ?? contextData.MaskSize ?? 50}px ${maskSize ?? contextData.MaskSize ?? 50}px`;

  useEffect(() => {
    if (!ref.current) return;
   
    ref.current.onmousemove = (e) => {
      if (contextData.setMaskSize){
        contextData.setMaskSize(focusMaskWidth ?? 160);
        console.log("Enter");
      }
    }

    ref.current.onmouseleave = (e) => {
      if (contextData.setMaskSize){
        contextData.setMaskSize(maskWidth ?? 60);
        console.log("Leave");
      }
    }
  }, [contextData, focusMaskWidth, maskWidth]);

  return (
    <div ref={ref} className={cn("block", className)}>
      <motion.div
        style={{
          position: "absolute",
          maskImage: "linear-gradient(black, black), url(\"/circle.svg\")",
          maskComposite: "intersect",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT,
          maskPosition: maskPosition,
        }}
      >
        {secret}
      </motion.div>

      <motion.div
        style={{
          maskImage: "linear-gradient(black, black), url(\"/circle.svg\")",
          maskComposite: "exclude",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT,
          maskPosition: maskPosition,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SecretContent;