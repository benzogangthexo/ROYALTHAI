"use client";

import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import { useEffect, type ComponentProps } from "react";

import { setScrollLocked } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

function LockLenis() {
  useEffect(() => {
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);
  return null;
}

/** shadcn/ui Dialog: оверлей + контент, Lenis на паузе, Esc и фокус-ловушка из Radix */
export function DialogContent({
  className,
  children,
  closeLabel = "Закрыть",
  ...props
}: ComponentProps<typeof D.Content> & { closeLabel?: string }) {
  return (
    <D.Portal>
      <LockLenis />
      <D.Overlay className="fixed inset-0 z-80 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <D.Content
        data-lenis-prevent
        className={cn(
          "fixed left-1/2 top-1/2 z-80 max-h-[92svh] w-[min(94vw,56rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[var(--radius-xl)] border border-line bg-surface p-4 text-fg shadow-[var(--shadow-lift)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-6",
          className,
        )}
        {...props}
      >
        {children}
        <D.Close
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-bg/70 text-fg backdrop-blur hover:bg-bg"
          aria-label={closeLabel}
        >
          <X aria-hidden="true" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
