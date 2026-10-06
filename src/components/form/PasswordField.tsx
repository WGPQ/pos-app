"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export default function PasswordField({ label, id, className = "", disabled, ...props }: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const action = `${visible ? "Ocultar" : "Mostrar"}: ${label.toLowerCase()}`;

  return <div>
    <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative mt-2">
      <input {...props} id={inputId} disabled={disabled} type={visible ? "text" : "password"}
        className={`h-11 w-full rounded-xl border border-gray-200 pl-3 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 ${className}`} />
      <button type="button" disabled={disabled} onClick={() => setVisible((current) => !current)}
        aria-label={action} aria-controls={inputId} title={action}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-xl text-gray-600 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:opacity-60">
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  </div>;
}
