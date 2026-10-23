import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "outline" | "soft" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export function Button({ children, className = "", variant = "primary", size = "md", ...props }: PropsWithChildren<ButtonProps>) {
  return <button className={"button button--" + variant + " button--" + size + " " + className} {...props}>{children}</button>;
}
