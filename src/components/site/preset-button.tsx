"use client";

import type { ComponentProps } from "react";

import { presetBooking } from "@/components/booking/preset";
import { Button } from "@/components/ui/button";

/** Кнопка с предвыбором в записи: единственный клиентский кусок серверной секции */
export function PresetButton({
  stepId,
  optionId,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & { stepId: string; optionId: string }) {
  return <Button {...props} onClick={() => presetBooking(stepId, optionId)} />;
}
