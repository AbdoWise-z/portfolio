import {useMotionValue, useSpring, useTransform} from "framer-motion";
import React, {useEffect, useState} from "react";
import {useWindowSize} from "@/hooks/use-window-size";
import {useSecretContextValues} from "@/views/providers/secret-content-context-provider";

export const useMaskPosition = (ref: React.RefObject<any>) => {
  const contextData = useSecretContextValues();
  
  const vMouseX = useMotionValue(0);
  const vMouseY = useMotionValue(0);

  const vMaskX = useSpring(vMouseX,{ stiffness: 1800, damping: 150 });
  const vMaskY = useSpring(vMouseY,{ stiffness: 1800, damping: 150 });

  useEffect(() => {
    if (!ref.current) return;
    const onMouseMove = ({clientX, clientY }: any) => {
      const layoutRect = ref.current.getBoundingClientRect();
      vMouseX.set(clientX - contextData.MaskSize!.get() / 2 - layoutRect.left);
      vMouseY.set(clientY - contextData.MaskSize!.get() / 2 - layoutRect.top);
    }

    window.addEventListener("mousemove" , onMouseMove);
  }, [vMouseX, vMouseY, ref, contextData.MaskSize]);

  // const windowSize = useWindowSize();
  // const transformedX = useTransform(vMaskX, [-windowSize.width, windowSize.width], [-windowSize.width, windowSize.width]);
  // const transformedY = useTransform(vMaskY, [-windowSize.height, windowSize.height], [-windowSize.height, windowSize.height]);

  return {
    transformedX: vMaskX,
    transformedY: vMaskY,
    contextData
  }
}