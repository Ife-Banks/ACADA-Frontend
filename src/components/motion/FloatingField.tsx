"use client";

/**
 * FloatingField — a labelled input whose label rises out of the field.
 *
 * The label starts inside the field and lifts (and shrinks) as soon as the
 * field has focus or content, then settles above the text. The focus ring is
 * tinted with the accent colour rather than the default blue.
 *
 * The input keeps a placeholder of a single space so the `:placeholder-shown`
 * trick works — that is what lets the label know the field is empty.
 */

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export interface FloatingFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  /** Extra markup rendered under the field. */
  hint?: ReactNode;
  /** Show the error state. */
  error?: string;
}

export function FloatingField({
  label,
  multiline = false,
  hint,
  error,
  id,
  className = "",
  ...inputProps
}: FloatingFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const field = multiline ? (
    <textarea
      id={fieldId}
      placeholder=" "
      className="float-field-control"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  ) : (
    <input
      id={fieldId}
      placeholder=" "
      className="float-field-control"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      {...inputProps}
    />
  );

  return (
    <div className={`float-field${error ? " float-field--error" : ""}${className ? ` ${className}` : ""}`}>
      {field}
      <label htmlFor={fieldId} className="float-field-label">
        {label}
      </label>
      {hint && !error && <p className="float-field-hint">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="float-field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default FloatingField;
