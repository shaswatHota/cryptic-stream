import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundGradientProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: BackgroundGradientProps) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,hsl(var(--primary)),transparent),radial-gradient(circle_farthest-side_at_100%_0,hsl(var(--accent)),transparent),radial-gradient(circle_farthest-side_at_100%_100%,hsl(var(--secondary)),transparent),radial-gradient(circle_farthest-side_at_0_0,hsl(var(--muted)),hsl(var(--card)))]"
        )}
      />
      <div
        className={cn(
          "relative z-10 rounded-[calc(1.5rem-1px)] bg-white dark:bg-zinc-900",
          "surface-primary",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};