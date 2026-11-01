"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store";

/** وضعیت ورود را از کوکی نشست می‌خواند؛ کوکی CSRF هم از همین درخواست می‌رسد */
export function AuthBootstrap() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
