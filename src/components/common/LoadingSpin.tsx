import cn from "@/libs/cn";

export default function LoadingSpin({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin size-32 border-10 border-stone-400 border-t-transparent rounded-full",
        className,
      )}
    />
  );
}
