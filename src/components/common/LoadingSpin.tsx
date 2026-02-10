import cn from "@/libs/cn";

export default function LoadingSpin({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"animate-spin h-5 w-5 border-2 border-stone-400 border-t-transparent rounded-full",
				className,
			)}
		/>
	);
}
