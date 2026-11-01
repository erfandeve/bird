"use client";

import { useToast } from "@/lib/store";

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 flex flex-col items-center gap-2 px-4 md:bottom-6" style={{ zIndex: "var(--z-toast)" }}>
      {toasts.map((t) => (
        <p key={t.id} className="toast-in rounded-full bg-olive-900 px-5 py-2.5 text-sm text-lemon-50">
          {t.text}
        </p>
      ))}
    </div>
  );
}
