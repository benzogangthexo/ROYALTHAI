"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** reducedMotion="user": motion/react сам гасит transform-анимации при prefers-reduced-motion */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
