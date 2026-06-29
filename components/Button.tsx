import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost" | "ghost-dark";

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
};

type ButtonAsButton = BaseProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button({ variant = "primary", children, ...props }: ButtonAsButton | ButtonAsLink) {
  const className = `${styles.btn} ${styles[variant]}`;

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    const isInternal = href.startsWith("/") && !href.startsWith("//");
    if (isInternal) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        className={className}
      >
        {children}
      </a>
    );
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
