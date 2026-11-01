"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** کشوی کناری بر پایهٔ <dialog> بومی تا فوکوس و Escape را مرورگر مدیریت کند */
export function Drawer({
  open,
  onClose,
  side = "end",
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end";
  label: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className={`fixed top-0 m-0 h-dvh max-h-none w-[min(420px,92vw)] max-w-none bg-lemon-50 text-olive-950 backdrop:bg-olive-950/45 ${
        side === "start" ? "start-0 end-auto" : "end-0 start-auto"
      }`}
    >
      <div className="flex h-full flex-col">{children}</div>
    </dialog>
  );
}
