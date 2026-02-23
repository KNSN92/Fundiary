import cn from "@/libs/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: keyof typeof VARIANT_STYLES;
  children?: React.ReactNode;
}

const VARIANT_STYLES = {
  primary:
    "bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer",
  danger:
    "bg-red-700 disabled:bg-red-900 hover:bg-red-900 enabled:cursor-pointer",
  outlined: "border border-white rounded-xl hover:brightness-75 cursor-pointer",
  ghost: "cursor-pointer hover:opacity-75",
} as const;

export function Button({
  variant,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(VARIANT_STYLES[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
