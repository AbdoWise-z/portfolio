"use client";

import React, {useRef} from 'react';
import {motion, useMotionTemplate} from "framer-motion";
import {useMaskPosition} from "@/hooks/use-mask-position";

/** The visible circle that follows the pointer and marks the "secret" reveal area. */
const SecretContentIndicator = (
    {color} : {color?: string}
) => {
    const ref = useRef<HTMLDivElement>(null);

    const {transformedX, transformedY, contextData} = useMaskPosition(ref);
    const size = useMotionTemplate`${contextData.MaskSize ?? 50}px`;
    const X = useMotionTemplate`${transformedX}px`;
    const Y = useMotionTemplate`${transformedY}px`;

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" ref={ref} aria-hidden>
            <motion.div
                style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    backgroundColor: color ?? "#007af3",
                    borderRadius: "100%",
                    x: X,
                    y: Y,
                }}
            />
        </div>
    );
};

export default SecretContentIndicator;
