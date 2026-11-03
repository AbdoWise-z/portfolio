"use client";

import React, {useRef} from 'react';
import {MotionValue, useMotionTemplate, motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {useMaskPosition} from "@/hooks/use-mask-position";
import {useSecretContextValues} from "@/components/providers/secret-content-context-provider";

const MASK_IMAGE = "linear-gradient(white, white), url(\"/circle.svg\")";

/**
 * Renders `children` normally, and `secret` only inside the cursor-following
 * circular mask. The secret layer is stretched over the content layer's box
 * (absolute, inset 0) so a single mask position is correct for both.
 */
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
    maskSize?: MotionValue<number>,
    className?: string,
    innerClassName?: string,
    /** Mask diameter restored when the pointer leaves. */
    maskWidth?: number;
    /** Mask diameter while the pointer is over this element. */
    focusMaskWidth?: number;
  }
) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const {enabled, setMaskSize} = useSecretContextValues();
  const {transformedX, transformedY, contextData} = useMaskPosition(contentRef);

  const size = maskSize ?? contextData.MaskSize ?? 50;
  const maskPosition = useMotionTemplate`center, ${transformedX}px ${transformedY}px`;
  const maskSizeT = useMotionTemplate`contain, ${size}px ${size}px`;

  const onMouseEnter = () => {
    if (setMaskSize && enabled) setMaskSize(focusMaskWidth ?? 160);
  };

  const onMouseLeave = () => {
    if (setMaskSize && enabled) setMaskSize(maskWidth ?? 60);
  };

  return (
    <div
      className={cn("relative flex w-fit h-fit", className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        aria-hidden
        style={{
          display: "block",
          position: "absolute",
          inset: 0,
          maskImage: MASK_IMAGE,
          maskComposite: "intersect",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT,
          maskPosition: maskPosition,
        }}
        className={innerClassName}
      >
        {secret}
      </motion.div>

      <motion.div
        ref={contentRef}
        style={{
          position: "relative",
          display: "block",
          maskImage: MASK_IMAGE,
          maskComposite: "exclude",
          maskRepeat: "no-repeat",
          maskSize: maskSizeT,
          maskPosition: maskPosition,
        }}
        className={innerClassName}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SecretContent;
