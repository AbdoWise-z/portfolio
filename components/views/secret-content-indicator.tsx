"use client";

import React, {useRef} from 'react';
import {motion, useMotionTemplate} from "framer-motion";
import {useMaskPosition} from "@/hooks/use-mask-position";

/**
 * The lens that follows the pointer. It sits above every section and inverts
 * whatever is beneath it, so the reveal works over images and solid panels too.
 * SecretContent elements swap their text inside the same circle.
 */
const SecretContentIndicator = () => {
    const ref = useRef<HTMLDivElement>(null);

    const {transformedX, transformedY, contextData} = useMaskPosition(ref);
    const size = useMotionTemplate`${contextData.MaskSize ?? 50}px`;
    const X = useMotionTemplate`${transformedX}px`;
    const Y = useMotionTemplate`${transformedY}px`;

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" ref={ref} aria-hidden>
            <motion.div
                style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: "100%",
                    x: X,
                    y: Y,
                    backgroundColor: "rgba(0, 122, 243, 0.28)",
                    boxShadow: "0 0 0 1px rgba(127, 190, 255, 0.35), 0 0 24px rgba(0, 122, 243, 0.25)",
                    backdropFilter: "invert(1)",
                    WebkitBackdropFilter: "invert(1)",
                }}
            />
        </div>
    );
};

export default SecretContentIndicator;
