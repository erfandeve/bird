"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} dir="ltr" className="field pe-12 text-start" />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
        className="absolute end-0.5 top-0.5 grid size-11 place-items-center rounded-full text-olive-700 hover:text-olive-950"
      >
        {show ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
