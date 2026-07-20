import type { ReactNode } from "react";

type FormLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
};

export function FormLabel({ children, htmlFor, required = false }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="form-label">
      {children}
      {required && <RequiredIndicator />}
    </label>
  );
}

export function RequiredIndicator() {
  return (
    <span className="form-required" aria-hidden="true">
      *
    </span>
  );
}

type FormHelperProps = {
  children: ReactNode;
  id?: string;
  tone?: "default" | "error" | "success";
};

export function FormHelper({
  children,
  id,
  tone = "default",
}: FormHelperProps) {
  return (
    <p id={id} className={`form-helper form-helper--${tone}`}>
      {children}
    </p>
  );
}

type FormFeedbackProps = {
  children: ReactNode;
  status: "error" | "success";
  centered?: boolean;
};

export function FormFeedback({
  children,
  status,
  centered = false,
}: FormFeedbackProps) {
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`form-feedback form-feedback--${status}${centered ? " form-feedback--centered" : ""}`}
    >
      {children}
    </p>
  );
}
