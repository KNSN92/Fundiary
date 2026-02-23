import cn from "@/libs/cn";

interface CardProps {
  variant: "bordered" | "elevated";
  className?: string;
  children?: React.ReactNode;
}

export function Card({ variant, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 text-base-text",
        variant === "bordered" && "border-2 border-base-dark bg-base-bg",
        variant === "elevated" && "bg-base-dark shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
