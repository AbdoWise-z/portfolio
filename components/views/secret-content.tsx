"use client";

import React, {useRef} from 'react';
import {MotionValue, useMotionTemplate, motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {useMaskPosition} from "@/hooks/use-mask-position";
import {DEFAULT_MASK_SIZE, useSecretContextValues} from "@/components/providers/secret-content-context-provider";

const MASK_IMAGE = "linear-gradient(white, white), url(\"/circle.svg\")";

/**
 * Renders `children` normally, and `secret` only inside the pointer-following
 * circle. The secret layer is stretched over the content layer's box
 * (absolute, inset 0) so a single mask position is correct for both.
 * Give secret text the `secret-ink` class: the lens inverts it.
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

  const {setMaskSize} = useSecretContextValues();
  const {transformedX, transformedY, contextData} = useMaskPosition(contentRef);

  const size = maskSize ?? contextData.MaskSize ?? 50;
  const maskPosition = useMotionTemplate`center, ${transformedX}px ${transformedY}px`;
  const maskSizeT = useMotionTemplate`contain, ${size}px ${size}px`;

  return (
    <div
      className={cn("relative flex w-fit h-fit", className)}
      onMouseEnter={() => setMaskSize?.(focusMaskWidth ?? 160)}
      onMouseLeave={() => setMaskSize?.(maskWidth ?? DEFAULT_MASK_SIZE)}
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
