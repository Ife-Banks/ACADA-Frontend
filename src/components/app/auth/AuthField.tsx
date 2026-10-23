"use client";

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

interface AuthFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

type FieldControlProps = { id?: string; "aria-describedby"?: string };

export function AuthField({ label, error, hint, required, children }: AuthFieldProps) {
  const id = useId();
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<FieldControlProps>, {
        id,
        "aria-describedby": descriptionId,
      })
    : children;

  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>
        {label}{required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> required</span>}
      </label>
      {control}
      {hint && !error && <p className="auth-field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="auth-field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
